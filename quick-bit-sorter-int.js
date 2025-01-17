import{calculateMaskInt,partitionNotStable,partitionReverseNotStableUpperBit}from"./sorter-utils-int.js";
import{getMaskAsArray}from"./sorter-utils.js";
export function quickBitSorterInt(array,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let mask=calculateMaskInt(array,start,endP1);
	if(!mask)return;
	let bList=getMaskAsArray(mask);
	if(bList[0]^31)return qbSortInt(array,start,endP1,bList,0,false);
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
	n1>1&&qbSortInt(array,start,finalLeft,getMaskAsArray(mask1),0,false);
	n2>1&&qbSortInt(array,finalLeft,endP1,getMaskAsArray(mask2),0,false)
}
function qbSortInt(array,start,endP1,bList,bListIndex,recalculate){
	if(recalculate&&bListIndex<3)bList=getMaskAsArray(calculateMaskInt(array,start,endP1)),bListIndex=0;
	if(bList.length-bListIndex<1)return;
	let finalLeft=partitionNotStable(array,start,endP1,1<<bList[bListIndex]), recalculateBitMask=finalLeft-start<2||endP1-finalLeft<2;
	finalLeft-start>1&&qbSortInt(array,start,finalLeft,bList,bListIndex+1,recalculateBitMask);
	endP1-finalLeft>1&&qbSortInt(array,finalLeft,endP1,bList,bListIndex+1,recalculateBitMask)
}