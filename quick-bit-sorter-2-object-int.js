import{getMaskAsArray}from"./sorter-utils.js";
import{calculateMaskInt,partitionStableLowMemInt,partitionReverseStableLowMemInt}from"./sorter-utils-object-int.js";
//No extra memory or limited size extra memory Quick Bit Sort
//No optimization for small n and small range implemented yet
export function quickBitSorterObjectIntLowMem(array,mapper,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let mask=calculateMaskInt(array,start,endP1,mapper);
	if(!mask)return;
	let bList=getMaskAsArray(mask),aux=Array(256);
	if(bList[0]^31)return qbSortInt(array,mapper,start,endP1,bList,0,aux,false);
	//there are negative numbers and positive numbers
	let finalLeft=partitionReverseStableLowMemInt(array,start,endP1,1<<31,mapper,aux), n1=finalLeft-start, n2=endP1-finalLeft, mask1=0, mask2=0;
	if(n1>1){//sort negative numbers
		mask1=calculateMaskInt(array,start,finalLeft,mapper);
		if(mask1===0)n1=0
	}
	if(n2>1){//sort positive numbers
		mask2=calculateMaskInt(array,finalLeft,endP1,mapper);
		if(mask2===0)n2=0
	}
	n1>1&&qbSortInt(array,mapper,start,finalLeft,getMaskAsArray(mask1),0,aux,false);
	n2>1&&qbSortInt(array,mapper,finalLeft,endP1,getMaskAsArray(mask2),0,aux,false)
}
function qbSortInt(array,mapper,start,endP1,bList,bListIndex,aux,recalculate){
	if(recalculate&&bListIndex<3)
		bList=getMaskAsArray(calculateMaskInt(array,start,endP1,mapper)),bListIndex=0;
	if(bList.length-bListIndex<1)return;
	let finalLeft=partitionStableLowMemInt(array,start,endP1,1<<bList[bListIndex],mapper,aux), recalculateBitMask=finalLeft-start<2||endP1-finalLeft<2;
	finalLeft-start>1&&qbSortInt(array,mapper,start,finalLeft,bList,bListIndex+1,aux,recalculateBitMask);
	endP1-finalLeft>1&&qbSortInt(array,mapper,finalLeft,endP1,bList,bListIndex+1,aux,recalculateBitMask)
}
