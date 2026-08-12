"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Home() {
  const[origin,setorigin]=useState("")
  const [dropoff,setdropoff]=useState("")
  const [query,setquery]=useState("")
  const [activeinput,setactiveinput]=useState<string>("")
  const [place,setplace]=useState([])
  useEffect(()=>{
    async function fetchplaces(){
      if(query=="")return;
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=a0121d6c1eb34c91bc42b8698129a390`,
        {method:"GET"}
      )
      const data = await res.json()
      setplace(data.features)
      console.log("data",data.features)
    }
    const timer = setTimeout(()=>{
      fetchplaces()
    },2000)
    return()=>clearTimeout(timer)
  },[query])
  return (
    <> 
    <div className='flex flex-col items-center justify-center h-screen'> 
      <div className="flex">
        <label htmlFor="">pickup</label> 
        <input type="text" name="" id="origin" value={origin} onChange={(e)=>{setquery(e.target.value);setorigin(e.target.value)}} onFocus={()=>{setactiveinput("origin"); setquery(origin)}}/>
        <label htmlFor="">dropoff</label>
        <input type="text" name="" id="dropoff" value={dropoff} onChange={(e)=>{setquery(e.target.value);setdropoff(e.target.value)}} onFocus={()=>{setactiveinput("dropoff"); setquery(dropoff)}}/>
      </div>
      <div>
        {place.map((val:any,ind:any)=>(
          <li key={ind}>{val?.properties?.formatted}</li>
        ))}
      </div>
     {/* <LazyMap/>  */}
    </div>
    </>
  )
}
