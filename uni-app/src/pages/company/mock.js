import Mock from 'mockjs';

const shareholderData = {
  path: /planBook\/common\/companyHolderShare/,
  data: {
    data: {
      companyRelationList: new Array(Mock.mock('@natural(6, 6)'))
        .fill(0)
        .map(() => {
          return {
            id: Mock.mock('@id'),
            pId: Mock.mock('@id'),
            shareRatio: Mock.mock('@number'),
          };
        }),
      companyInfos: new Array(Mock.mock('@natural(10, 20)')).fill(0).map(() => {
        return {
          id: Mock.mock('@id'),
          name: Mock.mock('@csentence(10,30)'),
          levels: new Array(Mock.mock('@natural(1, 7)'))
            .fill(0)
            .map(() => Mock.mock(`@natural(1, 7)`)),
        };
      }),
    },
    success: true,
  },
};

Mock.mock(shareholderData.path, shareholderData.data);
