'use client';
import { useRecoilState } from 'recoil';
import useStore from '@/client/useStore';
import { IComponents } from '@/app/component';
import Box from '@mui/joy/Box';

export default function Counter({ components }: { components: IComponents }) {
  const { loading, error, data, store, query } = useStore({ key: 'count' });
  const { Button } = components;
  const [count, setCount] = useRecoilState(store);
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  // console.log(data);
  return (
    <Box>
      <p>Count: {count}</p>
      {/* <button onClick={() => setCount(count + 1)}>Increment</button> */}
      <Button
        onClick={() =>
          query(
            'count',
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(setCount(count + 1)), 1000)
              )
          )
        }
      >
        Increment
      </Button>
      <components.Button
        onClick={() =>
          query(
            'count',
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve(setCount(count + 1)), 1000)
              )
          )
        }
      >
        Decrement
      </components.Button>
    </Box>
  );
}
