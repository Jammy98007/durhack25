import { redirect } from 'next/navigation';

const Page = () => {

    // this code is temporary - redirect user to random uuid
    const uuid = crypto.randomUUID();

    redirect(`/board/${uuid}`);

    return (
        <div className='w-screen h-screen'>
            This is the home page
        </div>
    )
}

export default Page