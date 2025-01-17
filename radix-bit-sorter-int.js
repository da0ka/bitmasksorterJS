import{arrayCopy,calculateSumOffsets,getSections}from"./sorter-utils.js";
import{calculateMaskInt,partitionReverseNotStableUpperBit}from"./sorter-utils-int.js";
import{getMaskAsArray}from"./sorter-utils.js";
export function radixBitSorterInt(array,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let mask=calculateMaskInt(array,start,endP1);
	if(!mask)return;
	let bList=getMaskAsArray(mask);
	if(bList[0]^31)return radixSortInt(array,start,endP1,bList,Array(endP1-start));
	//there are negative numbers and positive numbers
	let finalLeft=partitionReverseNotStableUpperBit(array,start,endP1),
		n1=finalLeft-start, n2=endP1-finalLeft, mask1=0, mask2=0;
	if(n1>1){//sort negative numbers
		mask1=calculateMaskInt(array,start,finalLeft);
		if(mask1===0)n1=0
	}
	if(n2>1){//sort positive numbers
		mask2=calculateMaskInt(array,finalLeft,endP1);
		if(mask2===0)n2=0
	}
	bList=Array(n1>n2?n1:n2);
	n1>1&&radixSortInt(array,start,finalLeft,getMaskAsArray(mask1),bList);
	n2>1&&radixSortInt(array,finalLeft,endP1,getMaskAsArray(mask2),bList)
}
function partitionStableInt(array,start,endP1,mask,aux){
	let left=start,right=0;
	for(;start<endP1;){
		let element=array[start++];
		element&mask?aux[right++]=element:array[left++]=element
	}
	arrayCopy(aux,0,array,left,right);
	return left
}
function partitionStableLastBitsInt(array,start,endP1,mask,dRange,aux){
	let i=start,count=Array(dRange).fill(0);
	for(;i<endP1;)count[array[i++]&mask]++;
	calculateSumOffsets(true,count,dRange);
	for(i=start;i<endP1;){
		let element=array[i++];
		aux[count[element&mask]++]=element
	}
	arrayCopy(aux,0,array,start,endP1-start)
}
function partitionStableGroupBitsInt(array,start,endP1,mask,shiftRight,dRange,aux){
	let i=start,count=Array(dRange).fill(0);
	for(;i<endP1;)count[(array[i++]&mask)>>shiftRight]++;
	calculateSumOffsets(true,count,dRange);
	for(i=start;i<endP1;){
		let element=array[i++];
		aux[count[(element&mask)>>shiftRight]++]=element
	}
	arrayCopy(aux,0,array,start,endP1-start)
}
function radixSortInt(array,start,end,bList,aux){
	for(let i=0,sections=getSections(bList),l=sections.length;i<l;){
		let{bits,shift,mask}=sections[i++];
		if(bits===1)partitionStableInt(array,start,end,mask,aux);
		else bits=1<<bits,shift
			?partitionStableGroupBitsInt(array,start,end,mask,shift,bits,aux)
			:partitionStableLastBitsInt(array,start,end,mask,bits,aux)
	}
}