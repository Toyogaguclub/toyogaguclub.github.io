const fs=require('fs'),zlib=require('zlib');
function decode(file){const b=fs.readFileSync(file);let p=8,W,H,bd,ct,il,idat=[];
 while(p<b.length){const len=b.readUInt32BE(p),t=b.toString('ascii',p+4,p+8),d=b.subarray(p+8,p+8+len);
  if(t==='IHDR'){W=d.readUInt32BE(0);H=d.readUInt32BE(4);bd=d[8];ct=d[9];il=d[12]}
  if(t==='IDAT')idat.push(d); if(t==='IEND')break; p+=12+len}
 if(bd!==8||il)throw new Error(`unsupported bd=${bd} il=${il} ct=${ct}`);
 const ch={6:4,2:3,0:1,4:2}[ct],raw=zlib.inflateSync(Buffer.concat(idat)),st=W*ch,out=Buffer.alloc(W*H*4),prev=Buffer.alloc(st),cur=Buffer.alloc(st);
 for(let y=0;y<H;y++){const f=raw[y*(st+1)];raw.copy(cur,0,y*(st+1)+1,y*(st+1)+1+st);
  for(let i=0;i<st;i++){const a=i>=ch?cur[i-ch]:0,u=prev[i],c=i>=ch?prev[i-ch]:0;let v=cur[i];
   if(f===1)v+=a;else if(f===2)v+=u;else if(f===3)v+=(a+u)>>1;else if(f===4){const pp=a+u-c,pa=Math.abs(pp-a),pb=Math.abs(pp-u),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?u:c)}cur[i]=v&255}
  for(let x=0;x<W;x++){const o=(y*W+x)*4,i=x*ch;if(ch===4){out[o]=cur[i];out[o+1]=cur[i+1];out[o+2]=cur[i+2];out[o+3]=cur[i+3]}else if(ch===3){out[o]=cur[i];out[o+1]=cur[i+1];out[o+2]=cur[i+2];out[o+3]=255}else if(ch===1){out[o]=out[o+1]=out[o+2]=cur[i];out[o+3]=255}else{out[o]=out[o+1]=out[o+2]=cur[i];out[o+3]=cur[i+1]}}
  cur.copy(prev)}
 return {W,H,ct,px:out}}
const crcT=new Int32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c});
function crc(buf){let c=-1;for(const x of buf)c=crcT[(c^x)&255]^(c>>>8);return (c^-1)>>>0}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])}
function encode(file,W,H,px){const h=Buffer.alloc(13);h.writeUInt32BE(W,0);h.writeUInt32BE(H,4);h[8]=8;h[9]=6;const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;px.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4)}
 fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]))}
module.exports={decode,encode};
