export function arrayCopy(src,srcPos,dst,dstPos,length){
	while(length--)dst[dstPos++]=src[srcPos++];
	return dst;
}
export function swap(array,left,right){
	let aux=array[left];
	array[left]=array[right];
	array[right]=aux
}
export function reverse(A,a,z,b){
	for(;a<z;A[z]=b)b=A[a],A[a++]=A[--z]
}
export function rotateLeft(array,start,endP1,d){
	let n=endP1-start;
	d%=n;
	if(!d)return;
	if(n-d<d)return rotateRight(array,start,endP1,n-d);
	if(d<2){
		let i=start,aux=array[i];
		for(;++i<endP1;)array[i-1]=array[i];
		array[endP1-1]=aux
	}else
		reverse(array,start,start+d),
		reverse(array,start+d,endP1),
		reverse(array,start,endP1)
}
export function rotateRight(array,start,endP1,d){
	let n=endP1-start;
	d%=n;
	if(!d)return;
	if(n-d<d)return rotateLeft(array,start,endP1,n-d);
	if(d<2){
		let i=endP1-1,aux=array[i];
		for(;i>start;)array[i]=array[--i];
		array[start]=aux
	}else
		reverse(array,start,endP1),
		reverse(array,start,start+d),
		reverse(array,start+d,endP1)
}
export function calculateSumOffsets(asc,count,countLength){
	if(asc)for(let i=0,sum=0,c;i<countLength;sum+=c)
		c=count[i],count[i++]=sum;
	else for(let i=countLength,sum=0,c;i;sum+=c)
		c=count[--i],count[i]=sum
}
//11bits looks faster than 8 on AMD 4800H,8 should be faster on dual-core CPUs
const MAX_BITS_RADIX_SORT=11;
function reverseListGet(bList,index){return bList[bList.length-1-index]}

export function getSections(bList,maxBitsDigit){
	if(!bList||!bList.length)return[];
	if(!maxBitsDigit)maxBitsDigit=MAX_BITS_RADIX_SORT;
	let sections=[],b=1,shift=reverseListGet(bList,0),bits=1,l=bList.length;
	for(;b<l;){
		let bitIndex=reverseListGet(bList,b++);
		if(bitIndex<shift+maxBitsDigit)
			bits=bitIndex-shift+1;
		else{
			let start=shift+bits-1;
			sections.push({bits,shift,start,mask:getMaskRangeBits(start,shift)});
			shift=bitIndex;bits=1
		}
	}
	let start=shift+bits-1;
	sections.push({bits,shift,start,mask:getMaskRangeBits(start,shift)});
	return sections
}
export function getMaskAsArray(mask){
	for(var i=32,res=[];i;)mask>>--i&1&&res.push(i);
	return res
}
export function getMaskRangeBits(bStart,bEnd){return(1<<bStart+1-bEnd)-1<<bEnd}
export function getMaskLastBits(bList,bListStart){
	let mask=0,l=bList.length;
	for(;bListStart<l;)mask=mask|1<<bList[bListStart++];
	return mask
}