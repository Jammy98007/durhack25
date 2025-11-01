'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Board from '@/components/Board';
import { connect } from '@/lib/network';

const Page = () => {
  const params = useParams();
  useEffect(() => {
        const slug = params?.slug;
        if (typeof slug === "string") {
            connect(slug);
        }
  }, [params]);

  return (
    <div className="w-screen h-screen">
      <Board />
    </div>
  );
};

export default Page;
