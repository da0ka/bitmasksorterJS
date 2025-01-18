import{arrayCopy,calculateSumOffsets,getSections,reverse}from"./sorter-utils.js";
import{calculateMaskNumber,getMaskAsArrayNumber}from"./sorter-utils-number.js";
import{partitionReverseNotStableUpperBit}from"./sorter-utils-int.js";
export function radixBitSorterNumber(array,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let arrayFloat64=array instanceof  Float64Array?array:new Float64Array(array),
		arrayInt32=new Int32Array(arrayFloat64.buffer),//[0]=lower 32 bits,[1]higher 32 bits
		bList=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,start,endP1));
	if(!bList[0].length&&!bList[1].length)return;
	if(bList[1][0]^31)
		radixSortNumber(arrayInt32,arrayFloat64,start,endP1,bList,new Float64Array(endP1-start)),
		arrayInt32[1]&1<<31&&reverse(arrayFloat64,start,endP1);
	else{//there are negative numbers and positive numbers
		let finalLeft=partitionReverseNotStableUpperBit(arrayFloat64,start,endP1),
			n1=finalLeft-start, n2=endP1-finalLeft, bList2;
		if(n1>1)//sort negative numbers
			bList=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,start,finalLeft)),
			bList[0].length||bList[1].length||(n1=0);
		if(n2>1)//sort positive numbers
			bList2=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,finalLeft,endP1)),
			bList2[0].length||bList2[1].length||(n2=0);
		let auxFloat64=new Float64Array(n1>n2?n1:n2);
		if(bList[0].length||bList[1].length)
			radixSortNumber(arrayInt32,arrayFloat64,start,finalLeft,bList,auxFloat64),
			reverse(arrayFloat64,start,finalLeft);
		if(bList2[0].length||bList2[1].length)
			radixSortNumber(arrayInt32,arrayFloat64,finalLeft,endP1,bList2,auxFloat64)
	}
	arrayCopy(arrayFloat64,0,array,start,endP1-start)
}
function partitionStableNumber(arrayI32,arrayF64,start,endP1,mask,elementIndex,auxF64){
	let left=start,right=0;
	for(let i=start;i<endP1;){
		let element=arrayF64[i];
		arrayI32[i++*2+elementIndex]&mask?auxF64[right++]=element:arrayF64[left++]=element
	}
	arrayCopy(auxF64,0,arrayF64,left,right);
	return left
}
function partitionStableLastBitsNumber(arrayI32,arrayF64,start,endP1,mask,elementIndex,dRange,auxF64){
	let i=start,n=endP1-start,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[arrayI32[i++*2+elementIndex]&mask]++;
	calculateSumOffsets(true,count,dRange);
	for(i=start;i<endP1;)auxF64[count[arrayI32[i*2+elementIndex]&mask]++]=arrayF64[i++];
	arrayCopy(auxF64,0,arrayF64,start,n)
}
function partitionStableGroupBitsNumber(arrayI32,arrayF64,start,endP1,mask,elementIndex,shiftRight,dRange,auxF64){
	let i=start,n=endP1-start,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[(arrayI32[i++*2+elementIndex]&mask)>>>shiftRight]++;
	calculateSumOffsets(true,count,dRange);
	for(i=start;i<endP1;)auxF64[count[(arrayI32[i*2+elementIndex]&mask)>>>shiftRight]++]=arrayF64[i++];
	arrayCopy(auxF64,0,arrayF64,start,n)
}
function radixSortNumber(arrayI32,arrayF64,start,endP1,bList,auxF64){
	for(let e=0;e<2;e++)
		for(let i=0,sections=getSections(bList[e]),l=sections.length;i<l;){
			let{bits,shift,mask}=sections[i++];
			if(bits===1)
				partitionStableNumber(arrayI32,arrayF64,start,endP1,mask,e,auxF64);
			else bits=1<<bits,shift
				?partitionStableGroupBitsNumber(arrayI32,arrayF64,start,endP1,mask,e,shift,bits,auxF64)
				:partitionStableLastBitsNumber(arrayI32,arrayF64,start,endP1,mask,e,bits,auxF64);
		}
}
