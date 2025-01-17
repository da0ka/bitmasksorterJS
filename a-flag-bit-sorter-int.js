import{calculateSumOffsets,getMaskAsArray,getSections,swap}from"./sorter-utils.js";
import{calculateMaskInt,partitionReverseNotStableUpperBit}from"./sorter-utils-int.js";
export function aFlagBitSorterInt(array,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(endP1-start<2)return;
	let mask=calculateMaskInt(array,start,endP1);
	if(!mask)return;
	let bList=getMaskAsArray(mask);
	if(bList[0]===31){//there are negative numbers and positive numbers
		let finalLeft=partitionReverseNotStableUpperBit(array,start,endP1),
			n1=finalLeft-start,n2=endP1-finalLeft,mask1=0,mask2=0;
		if(n1>1){//sort negative numbers
			mask1=calculateMaskInt(array,start,finalLeft);
			if(mask1===0)n1=0
		}
		if(n2>1){//sort positive numbers
			mask2=calculateMaskInt(array,finalLeft,endP1);
			if(mask2===0)n2=0
		}
		n1>1&&aFlagSortInt(array,start,finalLeft,getMaskAsArray(mask1));
		n2>1&&aFlagSortInt(array,finalLeft,endP1,getMaskAsArray(mask2))
	}else aFlagSortInt(array,start,endP1,bList)
}
function aFlagSortInt(array,start,endP1,bList){
	let sections=getSections(bList,4);
	aFlagSortIntAux(array,start,endP1,sections,sections.length-1);
}
function aFlagSortIntAux(array,start,endP1,sections,sectionIndex){
	let section=sections[sectionIndex];
	let{bits,shift,mask}=section;
	let dRange=1<<bits,N = endP1 - start;
	let nextFree=new(N>>16?Uint32Array:N>>8?Uint16Array:Uint8Array)(dRange);
	for(let i=start;i<endP1;)nextFree[(array[i++]&mask)>>shift]++;
	calculateSumOffsets(true,nextFree,dRange);
	let offsets=nextFree.slice();
	for(let curBlock=0;curBlock<dRange;){
		let i=nextFree[curBlock]+start;
		if(i>=endP1||curBlock+1<dRange&&i>=offsets[curBlock+1]+start){
			++curBlock;continue
		}
		const elementHash=(array[i]&mask)>>shift, elementIndex=nextFree[elementHash]+start;
		i!==elementIndex&&swap(array,i,elementIndex);
		nextFree[elementHash]++
	}
	if(sectionIndex>0)
		for(let i=0;i<dRange;){
			let start2=offsets[i++], end2=i<dRange?offsets[i]:N;
			end2-start2>1&&aFlagSortIntAux(array,start2+start,end2+start,sections,sectionIndex-1)
		}
}
