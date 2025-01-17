import{getMaskAsArray}from"./sorter-utils.js";
import{partitionReverseStableInt,partitionStableInt,calculateMaskInt}from"./sorter-utils-object-int.js";
export function quickBitSorterObjectInt(array,mapper,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let mask=calculateMaskInt(array,start,endP1,mapper);
	if(!mask)return;
	let bList=getMaskAsArray(mask), aux=Array(endP1-start);
	if(bList[0]^31)return qbSortInt(array,mapper,start,endP1,bList,0,aux,false);
	//there are negative numbers and positive numbers
	let finalLeft=partitionReverseStableInt(array,start,endP1,1<<31,aux,mapper),
		n1=finalLeft-start, n2=endP1-finalLeft, mask1=0, mask2=0;
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
	let n=endP1-start;
	if(recalculate&&bListIndex<3){
		let mask=calculateMaskInt(array,start,endP1,mapper);
		bList=getMaskAsArray(mask);
		bListIndex=0;
	}
	if(bList.length-bListIndex<1)return;
	let sortMask=1<<bList[bListIndex];
	let finalLeft=partitionStableInt(array,start,endP1,sortMask,aux,mapper);
	let recalculateBitMask=finalLeft-start<2||endP1-finalLeft<2;
	if(finalLeft-start>1){
		qbSortInt(array,mapper,start,finalLeft,bList,bListIndex+1,aux,recalculateBitMask);
	}
	if(endP1-finalLeft>1){
		qbSortInt(array,mapper,finalLeft,endP1,bList,bListIndex+1,aux,recalculateBitMask);
	}
}
