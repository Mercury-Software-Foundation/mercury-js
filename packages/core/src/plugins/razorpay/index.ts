import { GraphQLError } from 'graphql/error';
import type { Ecommerce } from '../../packages/ecommerce';
import Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils';

export interface RazorPayConfig {
  RAZOR_PAY_API_KEY: string;
  RAZOR_PAY_SECRET_KEY: string;
}

export default (config: RazorPayConfig) => {
  return async (ecommerce: Ecommerce) => {
    const razorPay = new RazorPay(ecommerce, config);
    razorPay.init();
    razorPay.run();
  };
};

class RazorPay {
  public ecommerce: Ecommerce;
  private RAZOR_PAY_API_KEY: string;
  private RAZOR_PAY_SECRET_KEY: string;
  private razorPay: any;
  constructor(ecommerce: Ecommerce, config: RazorPayConfig) {
    this.ecommerce = ecommerce;
    this.RAZOR_PAY_API_KEY = config.RAZOR_PAY_API_KEY;
    this.RAZOR_PAY_SECRET_KEY = config.RAZOR_PAY_SECRET_KEY;
  }

  init() {
    // create an instance of razorpay
    this.razorPay = new Razorpay({
      key_id: this.RAZOR_PAY_API_KEY || '',
      key_secret: this.RAZOR_PAY_SECRET_KEY || '',
    });
  }

  run() {
    this.ecommerce.platform.mercury.addGraphqlSchema(
      `
      type Mutation {
        initiatePayment(amount: Float, discountedAmount: Float, code: String, currency: String, shippingAddress: String!, billingAddress: String!, customer: String!): paymentOrder
        capturePayment(paymentId: String, razorpayPaymentId: String, razorpayOrderId: String, razorPaySignature: String, cartItem: String): String
      }

      type paymentOrder {
        order: OrderData
        paymentId: String
        invoice: String
      }

      type OrderData {
        id: String
        amount: Int
        currency: String
      }
    `,
      {
        Mutation: {
          initiatePayment: async (
            root: any,
            {
              amount,
              discountedAmount,
              code,
              currency,
              shippingAddress,
              billingAddress,
              customer,
            }: {
              amount: number;
              discountedAmount: number;
              code: string;
              currency: string;
              shippingAddress: string;
              billingAddress: string;
              customer: string;
            },
            ctx: any
          ) => {
            try {
              const order = this.razorPay.orders.create({
                amount: amount * 100,
                currency: currency,
                receipt: 'TEST_RECEIPT',
              });

              const payment =
                await this.ecommerce.platform.mercury.db.Payment.create(
                  {
                    amount: amount,
                    date: Date.now(),
                    gateway: 'RAZORPAY',
                    razorPayOrderId: order.id,
                    razorPayOrderStatus: order.status,
                    attempts: order.attempts,
                    currency: order.currency,
                  },
                  ctx.user,
                  {}
                );

              const coupon =
                await this.ecommerce.platform.mercury.db.Coupon.get(
                  { code },
                  ctx.user
                );

              const invoice =
                await this.ecommerce.platform.mercury.db.Invoice.create(
                  {
                    customer,
                    billingAddress,
                    shippingAddress,
                    totalAmount: amount,
                    discountedAmount,
                    couponApplied: coupon?.id,
                    payment: payment.id,
                    status: 'Pending',
                  },
                  ctx.user
                );

              return {
                order: order,
                paymentId: payment.id,
                invoice: invoice.id,
              };
            } catch (error: any) {
              throw new GraphQLError(error);
            }
          },
          capturePayment: async (
            root: any,
            {
              paymentId,
              razorpayPaymentId,
              razorpayOrderId,
              razorPaySignature,
              cartItem,
            }: {
              paymentId: string;
              razorpayPaymentId: string;
              razorpayOrderId: string;
              razorPaySignature: string;
              cartItem?: string;
            },
            ctx: any
          ) => {
            try {
              const PaymentSchema = this.ecommerce.platform.mercury.db.Payment;
              const RazorpayPayment = await this.razorPay.payments.fetch(
                razorpayPaymentId
              );
              const RazorPayOrder = await this.razorPay.orders.fetch(
                razorpayOrderId
              );
              const isPaymentValid = validatePaymentVerification(
                { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
                razorPaySignature,
                process.env.RAZOR_PAY_SECRET_KEY || ''
              );
              const status = isPaymentValid ? 'SUCCESS' : 'FAILURE';
              await PaymentSchema.update(
                paymentId,
                {
                  mode: RazorpayPayment.method,
                  razorPayPaymentId: razorpayPaymentId,
                  razorPayPaymentStatus: RazorpayPayment.status,
                  razorPaySignature: razorPaySignature,
                  razorPayOrderStatus: RazorPayOrder.status,
                  attempts: RazorPayOrder.attempts,
                  status: status,
                },
                ctx.user,
                {
                  buyNowCartItemId: cartItem,
                }
              );

              if (isPaymentValid) return 'Payment is successful';
              throw new GraphQLError('Invalid Payment Signature');
            } catch (error: any) {
              throw new GraphQLError(error.message);
            }
          },
        },
      }
    );
  }
}
