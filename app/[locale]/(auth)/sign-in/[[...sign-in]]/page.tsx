import { SignIn } from '@clerk/nextjs'
import { div } from 'motion/react-client'

export default function Page() {
  return <div className='flex justify-center items-center w-full min-h-screen'><SignIn /></div>
}