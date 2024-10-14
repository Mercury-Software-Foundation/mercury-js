export default {
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
      component: 'Counter',
      props: {},
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
