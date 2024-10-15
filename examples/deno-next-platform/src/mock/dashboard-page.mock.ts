export const dashboardPageMock = {
  path: '/dashboard/home',
  page: [
    {
      index: 0,
      component: 'Text',
      props: {
        level: 'h1',
        children: 'Dashboard Home',
      },
    },
    {
      index: 1,
      component: 'Button',
      props: {
        children: 'Go to Dashboard',
        onClick: 'goToDashboard',
      },
    },
    {
      index: 2,
      component: 'Button',
      props: {
        children: 'Go to Profile',
        onClick: 'goToProfile',
      },
    },
  ],
};

export const loginPageMock = {
  path: '/login',
  page: [
    {
      index: 0,
      component: 'Text',
      props: {
        level: 'h1',
        children: 'Login',
      },
    },
    {
      index: 1,
      component: 'Button',
      props: {
        children: 'Login',
        onClick: 'login',
      },
    },
  ],
};
