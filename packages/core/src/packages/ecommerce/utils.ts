import { GraphQLError } from 'graphql';
import type { Mercury } from '../../mercury';
// import puppeteer from 'puppeteer';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import nodemailer from 'nodemailer';
import { Msg91Adapter } from './Adapters/MessageService/Msg91Adapter';

export const handleAddToCartForExistingCart = async (
  cartId: string,
  mercury: Mercury,
  user: any,
  productItem: string,
  priceBookItem: string,
  quantity: number,
  productPrice: number
) => {
  const mercuryInstance = mercury.db;
  if (!cartId) {
    throw new GraphQLError('Something went wrong');
  }
  const cartItem = await mercuryInstance.CartItem.get(
    {
      cart: cartId,
      productItem,
      priceBookItem,
    },
    user
  );
  const newQty = cartItem?.id ? cartItem.quantity + quantity : quantity;
  await mercuryInstance.CartItem.mongoModel.updateOne(
    {
      cart: cartId,
      productItem,
      priceBookItem,
    },
    {
      $set: {
        quantity: newQty,
        amount: (productPrice || 0) * newQty,
      },
    },
    {
      upsert: true,
    }
  );

  await recalculateTotalAmountOfCart(cartId, mercury, user);
};
export const applyCoupon = async (
  coupon: string,
  amount: number,
  mercury: Mercury,
  user: any
): Promise<{ discountedAmount: number; message: string }> => {
  let couponData = await mercury.db.Coupon.list({ code: coupon }, user);
  if (!couponData?.length) {
    throw new GraphQLError('Invalid Coupon');
  }
  couponData = couponData[0];
  if (!couponData?.active) {
    throw new GraphQLError('Coupon is inactive or expired');
  }
  if (amount < couponData.minOrderPrice) {
    throw new GraphQLError(
      `Coupon not applicable. Minimum order amount is ${couponData.minOrderPrice}`
    );
  }
  let discountedAmount = 0;
  if (couponData.discountType === 'FIXED_AMOUNT') {
    discountedAmount = couponData.discountValue;
  } else if (couponData.discountType === 'PERCENTAGE') {
    discountedAmount = (amount * couponData.discountValue) / 100;
    if (discountedAmount > couponData.maxDiscountValue) {
      discountedAmount = couponData.maxDiscountValue;
    }
  }
  return {
    discountedAmount,
    message: 'Coupon Applied!!',
  };
};
export const recalculateTotalAmountOfCart = async (
  cart: any,
  mercury: Mercury,
  user: any
) => {
  const cartItems = await mercury.db.CartItem.list({ cart }, user);
  const totalAmount = cartItems.reduce(
    (amount: number, item: any) => amount + item.amount,
    0
  );
  await mercury.db.Cart.update(cart, { totalAmount }, user);
};

export const syncAddressIsDefault = async (
  customer: string,
  mercury: Mercury,
  user: any
) => {
  const mercuryInstance = mercury.db;
  const existingDefaultAddress = await mercuryInstance.Address.get(
    {
      customer: customer,
      isDefault: true,
    },
    user
  );
  if (existingDefaultAddress.id) {
    await mercuryInstance.Address.update(
      existingDefaultAddress,
      { isDefault: false },
      user,
      { skipHook: true }
    );
  }
};

// export const generatePDF = async (htmlContent: any) => {
//   const browser = await puppeteer.launch({
//     executablePath: puppeteer.executablePath(),
//     headless: true,
//   });
//   const page = await browser.newPage();
//   await page.addScriptTag({ url: "https://cdn.tailwindcss.com" })
//   await page.setContent(htmlContent);
//   const pdfBuffer = await page.pdf({ format: 'A4' });

//   await browser.close();
//   return pdfBuffer;
// };

export const uploadToCloudinary = async (pdfBuffer: any, invoiceId: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream({ folder: 'invoice' }, (error: any, result: unknown) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(pdfBuffer);
  });
};

export const uploadPdfBuffer = async (buffer: any) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: 'invoices' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
const getTransporter = (senderEmail?: string, password?: string) => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: senderEmail,
      pass: password,
    },
  });
};
export const sendOrderConfirmationMail = async (
  email: string,
  mobile: string,
  domain: string,
  emailTemplate: string,
  senderEmail: string,
  senderName: string,
  smsTemplate: string,
  apiKey: string,
  secure_url?: any,
  firstName?: string,
  order_id?: string
) => {
  // const transporter = getTransporter(senderEmail, password);
  // const mailOptions = {
  //   from: senderEmail,
  //   to: email,
  //   subject: 'Order Confirmation',
  //   text: `Your OrderInvoice `,
  //   html: getHtml(firstName, secure_url)
  // };
  // const info = await transporter.sendMail(mailOptions);
  const msg91 = new Msg91Adapter(apiKey);
  const EmailTo = [
    {
      email,
      name: firstName || '',
      firstName: firstName || '',
      secure_url: secure_url || '',
      order_id: order_id || '',
    },
  ];
  const EmailFrom = {
    email: senderEmail,
    name: senderName,
  };

  const MessageTo = [
    {
      mobileNumber: mobile,
      firstName: firstName || '',
      secure_url: secure_url || '',
      order_id: order_id || '',
    },
  ];

  const emailRes = await msg91.sendEmail(
    EmailTo,
    EmailFrom,
    domain,
    emailTemplate
  );
  if (!emailRes.success) {
    console.error(emailRes.message);
  }
  const smsRes = await msg91.sendMessage(MessageTo, smsTemplate);
  if (!smsRes.success) {
    console.error(smsRes.message);
  }
};

export const getInvoiceHtml = async (
  invoice: string,
  mercury: Mercury,
  user: any,
  order: string
) => {
  const invoiceData: any = await mercury.db.Invoice.get(
    { _id: invoice },
    user,
    {
      populate: [
        {
          path: 'customer',
        },
        {
          path: 'shippingAddress',
        },
        {
          path: 'billingAddress',
        },
        {
          path: 'payment',
        },
        {
          path: 'invoiceLines',
          populate: [
            {
              path: 'productItem',
            },
          ],
        },
      ],
    }
  );
  let html = `<!DOCTYPE html>
  <html lang="en">
   
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
          .container {
              background-color: white;
              color: black;
              padding: 2rem;
              border-radius: 0.5rem;
              box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          }
   
          .center-content {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 0;
          }
   
          .image {
              width: auto;
              height: 100px;
          }
   
          .text-center {
              text-align: center;
              margin-bottom: 2rem;
          }
   
          .title {
              font-size: 1.5rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
          }
   
          .flex {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2rem;
          }
   
          .section-title {
              font-size: 1.125rem;
              font-weight: 600;
              margin-bottom: 1rem;
          }
   
          .font-bold {
              font-weight: bold;
          }
   
          .grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 1rem;
              font-weight: bold;
              color: #4A5568;
          }
   
          .grid-item {
              margin-bottom: 1rem;
          }
   
          .border-t {
              border-top: 1px solid #D1D5DB;
              margin: 1rem 0;
          }
   
          .text-blue {
              color: #4299E1;
          }
   
          .text-lg {
              font-size: 1.125rem;
              font-weight: bold;
          }
   
          .mb-4 {
              margin-bottom: 1rem;
          }
   
          .justify-between {
              display: flex;
              justify-content: space-between;
          }
  </style>
  </head>
   
  <body>
  <div class="container">
  <div class="center-content">
  <img src="https://www.slaycoffee.in/cdn/shop/files/logo.png?v=1714476294&width=240" class="image" alt="image" />
  </div>
  <div class="text-center">
  <h1 class="title">Invoice</h1>
  <p>Order #${order}</p>
  <p>Placed on ${new Date().toLocaleDateString()}</p>
  </div>
   
          <div class="flex">
  <div>
  <h2 class="section-title">Billed To</h2>
  <p class="font-bold">${invoiceData?.shippingAddress?.name}</p>
  <p>${
    invoiceData?.shippingAddress?.street
      ? `${invoiceData?.shippingAddress?.street},`
      : ''
  } ${
    invoiceData?.shippingAddress?.addressLine1
      ? `${invoiceData?.shippingAddress?.addressLine1},`
      : ''
  }, </p>
  <p>${
    invoiceData?.shippingAddress?.addressLine2
      ? `${invoiceData?.shippingAddress?.addressLine2},`
      : ''
  } ${
    invoiceData?.shippingAddress?.landmark
      ? `${invoiceData?.shippingAddress?.landmark},`
      : ''
  }, </p>
  <p>${
    invoiceData?.shippingAddress?.city
      ? `${invoiceData?.shippingAddress?.city},`
      : ''
  }${
    invoiceData?.shippingAddress?.state
      ? `${invoiceData?.shippingAddress?.state},`
      : ''
  }, ${
    invoiceData?.shippingAddress?.zipCode
      ? `${invoiceData?.shippingAddress?.zipCode},`
      : ''
  }</p>
  <p>Mobile: ${
    invoiceData?.shippingAddress?.mobile
      ? `${invoiceData?.shippingAddress?.mobile},`
      : ''
  } </p>
  </div>
  <div>
  <h2 class="section-title">Shipped To</h2>
  <p class="font-bold">${
    invoiceData?.billingAddress?.name
      ? `${invoiceData?.billingAddress?.name},`
      : ''
  }</p>
  <p>${
    invoiceData?.billingAddress?.street
      ? `${invoiceData?.billingAddress?.street},`
      : ''
  }, ${
    invoiceData?.billingAddress?.addressLine1
      ? `${invoiceData?.billingAddress?.addressLine1},`
      : ''
  }, </p>
  <p>${
    invoiceData?.billingAddress?.addressLine2
      ? `${invoiceData?.billingAddress?.addressLine2},`
      : ''
  }, ${
    invoiceData?.billingAddress?.landmark
      ? `${invoiceData?.billingAddress?.landmark},`
      : ''
  }, </p>
  <p>${
    invoiceData?.billingAddress?.city
      ? `${invoiceData?.billingAddress?.city},`
      : ''
  }, ${
    invoiceData?.billingAddress?.state
      ? `${invoiceData?.billingAddress?.state},`
      : ''
  }, ${
    invoiceData?.billingAddress?.zipCode
      ? `${invoiceData?.billingAddress?.zipCode},`
      : ''
  }</p>
  <p> Mobile: ${
    invoiceData?.billingAddress?.mobile
      ? `${invoiceData?.billingAddress?.mobile},`
      : ''
  } </p>
  </div>
  <div>
  <h2 class="section-title">Invoice Details</h2>
  <p><span class="font-bold">Invoice #:</span> ${invoiceData.id}</p>
  <p><span class="font-bold">Payment Status:</span> ${
    invoiceData?.payment?.status
  }</p>
  <p><span class="font-bold">Fulfillment Status:</span> Fulfilled</p>
  </div>
  </div>
   
          <div class="border-t"></div>
   
          <div>
  <h2 class="section-title">Order Details</h2>
  <div class="grid">
  <span>Product</span>
  <span>Price</span>
  <span>Quantity</span>
  <span>Total</span>
  </div>
              ${invoiceData?.invoiceLines
                ?.map(
                  (item: any) => `
  <div class="grid grid-item">
  <span class="text-blue">${item?.productItem?.name}</span>
  <span>₹ ${item?.pricePerUnit}</span>
  <span>${item?.quantity}</span>
  <span>₹ ${item?.amount || 0}</span>
  </div>`
                )
                .join('')}
  </div>
   
          <div class="border-t"></div>
   
          <div class="justify-between mb-4">
  <span class="font-semibold">Subtotal</span>
  <span>₹ ${invoiceData?.totalAmount || 0}</span>
  </div>
  <div class="justify-between mb-4">
  <span class="font-semibold">Shipping</span>
  <span>₹ 0</span>
  </div>
  <div class="justify-between mb-4">
  <span class="font-semibold">Tax (CGST 2.5%)</span>
  <span>₹ 0</span>
  </div>
  <div class="justify-between mb-4">
  <span class="font-semibold">Tax (IGST 2.5%)</span>
  <span>₹ 0</span>
  </div>
   
          <div class="border-t"></div>
   
          <div class="justify-between font-bold text-lg">
  <span>Total</span>
  <span>₹ ${invoiceData?.totalAmount}</span>
  </div>
  </div>
  </body>
   
  </html>
  `;

  return html;
};

const getHtml = (firstName?: string, secure_url?: any) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Slay-Coffee - Invoice Download</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      <div style="width: 100%; max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-top: 0;">Thank You for Your Order!</h1>
          <p style="margin: 0 0 10px;">Dear ${firstName},</p>
          <p style="margin: 0 0 10px;">Thank you for ordering from Slay Coffee! We're thrilled to be a part of your coffee experience. Your order has been successfully processed & You can download the invoice for your order using the link below:</p>
          <div style="display: flex; justify-content: center; align-items: center;">
            <a href=${secure_url} target="_blank" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Invoice</a>
          </div>
          <p style="margin: 20px 0;">If you have any questions or need further assistance, feel free to reach out to us at:</p>
          <div style="margin-top: 20px; font-size: 14px; color: #777;">
              <p style="margin: 0;">Warm regards,</p>
              <p style="margin: 0;">The Slay-Coffee Team</p>
              <p style="margin: 0;">Email: support@slay-coffee.com</p>
              <p style="margin: 0;">Address: No.2734, Ground Floor, I Sector 16th Cross, 27th Main Rd, opp. NIFT College, PWD Quarters, 1st Sector, HSR Layout, Bengaluru, Karnataka 560102</p>
          </div>
      </div>
  </body>
  </html>`;
};