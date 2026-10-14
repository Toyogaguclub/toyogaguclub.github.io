// resize.js FILE MAX — box-downscale a PNG in place so its long side <= MAX (alpha kept, max deflate)
const {decode,encode}=require('./png.js');
const [,,f,mx]=process.argv,{W,H,px}=decode(f),k=Math.max(W,H)/(+mx);
if(k<=1){encode(f,W,H,px);process.exit(0)}
const ow=Math.round(W/k),oh=Math.round(H/k),o=Buffer.alloc(ow*oh*4);
for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const x0=Math.floor(x*k),x1=Math.min(W,Math.floor((x+1)*k)),y0=Math.floor(y*k),y1=Math.min(H,Math.floor((y+1)*k));let r=0,g=0,b=0,a=0,n=0;
 for(let yy=y0;yy<Math.max(y1,y0+1);yy++)for(let xx=x0;xx<Math.max(x1,x0+1);xx++){const i=(yy*W+xx)*4,al=px[i+3];r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;a+=al;n++}
 const j=(y*ow+x)*4;if(a){o[j]=Math.round(r/a);o[j+1]=Math.round(g/a);o[j+2]=Math.round(b/a)}o[j+3]=Math.round(a/n)}
encode(f,ow,oh,o);
