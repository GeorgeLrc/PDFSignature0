import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context-api/AppContext'


export default function Report() {

  const { requests, getRequests } = useContext(AppContext);

  const [requestsCount, setRequestsCount] = useState(0);
  const [success, setSuccess] = useState(0)
  const [denied, setDenied] = useState(0)
  const [pending, setPending] = useState()

  useEffect(() => {
    getRequests();
  }, [])

  useEffect(() => {
    if (requests && requests.length > 0) {
      setRequestsCount(requests.length);

      // Count statuses
      const successCount = requests.filter(req => req.status === "approved").length;
      const deniedCount = requests.filter(req => req.status === "rejected").length;
      const pendingCount = requests.filter(req => req.status === "pending").length;

      setSuccess(successCount);
      setDenied(deniedCount);
      setPending(pendingCount);
    }
  }, [requests])

  return (
    <div>
      <h2>Dashboard</h2><br />
      <div className='flex flex-row justify-evenly gap-2'>
        <div className='border border-black px-3 py-3'>Request <br /> {requestsCount}</div>
        <div className='border border-black px-3 py-3'>Success <br /> {success}</div>
        <div className='border border-black px-3 py-3'>Denied <br /> {denied}</div>
        <div className='border border-black px-3 py-3'>Pending <br /> {pending}</div>
      </div>
    </div>
  )
}
