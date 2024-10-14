import { atom, RecoilState } from 'recoil';
export const user = atom({
  key: 'user',
  default: null,
});
export const count = atom({
  key: 'count',
  default: 0,
});

export interface IStores {
  user: RecoilState<any>;
  count: RecoilState<number>;
}

export const stores: IStores = {
  user: user,
  count: count,
};
