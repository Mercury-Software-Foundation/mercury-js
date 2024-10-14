import { useEffect, useState } from 'react';
import { RecoilState } from 'recoil';
import { stores, IStores } from './store';

type TSoreResponse = {
  loading: boolean;
  error: any;
  data: any;
  store: RecoilState<any>;
  query: (key: string, cb: () => Promise<unknown>) => void;
};

function hasProperty(obj: IStores, key: string): key is keyof IStores {
  return key in obj;
}

const useStore = ({ key }: { key: keyof IStores }): TSoreResponse => {
  const [store, setStore] = useState<RecoilState<any>>(stores[key]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  // useEffect(() => {
  //   const fetchStore = () => {
  //     try {
  //       if (!hasProperty(stores, key)) {
  //         throw new Error(`Store not found for key: ${key}`);
  //       }
  //       setStore(stores[key]);
  //       setLoading(false);
  //     } catch (error: any) {
  //       setError(error);
  //       setLoading(false);
  //     }
  //   };
  //   fetchStore();
  // }, [key]);

  const query = async (key: string, cb: () => Promise<unknown>) => {
    try {
      setLoading(true);
      const query = await cb();
      if (query) {
        setData({ ...data, [key]: query });
      }
      console.log('query', data);
      setLoading(false);
    } catch (error: any) {
      setError(error);
      setLoading(false);
    }
  };

  return { loading, error, data, store, query };
};

export default useStore;
