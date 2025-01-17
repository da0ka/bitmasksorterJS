import{arrayCopy,getMaskAsArray,getSections}from"./sorter-utils.js";
import{
	calculateMaskInt,
	partitionReverseStableInt,
	partitionReverseStableLowMemInt
}from"./sorter-utils-object-int.js";
import{getKeySN,getSectionsBits,validatePCountSortRange}from"./p-count-bit-sorter-int.js";
export function pCountBitSorterObjectInt(array,mapper,start,endP1,bList,bListStart){
	if(!start)start=0;
	if(!endP1)endP1=array.length;
	if(!bList)bList=getMaskAsArray(calculateMaskInt(array,start,endP1,mapper)),bListStart=0;
	if(bList[bListStart]===31){//there are negative numbers and positive numbers
		let finalLeft=partitionReverseStableInt(array,start,endP1,1<<31,Array(endP1-start),mapper);//finalLeft=partitionReverseStableLowMemInt(array,start,endP1,1<<31,mapper,aux)
		finalLeft-start>1&&pCountBitSorterObjectInt(array,mapper,start,finalLeft);//sort negative numbers
		return endP1-finalLeft>1&&pCountBitSorterObjectInt(array,mapper,finalLeft,endP1)//sort positive numbers
	}
	let N=endP1-start, sections=getSections(bList.slice(bListStart),32);
	if(sections.length===1){
		let section=sections[0], shift=section.shift;
		if(shift===0){
			let mask=section.mask;
			if(mapper(array[start])&~mask)//last bits but there is a mask for a bigger number
				(mask+1<N?pCountSortEndingMaskV1:pCountSortEndingMaskV2)(array,mapper,start,endP1,mask);
			else//last bits and includes all numbers and all positive numbers
				shift=1<<section.bits,
				(shift<N?pCountSortPositiveV1:pCountSortPositiveV2)(array,mapper,start,endP1,shift)
		}else(1<<section.bits<N?pCountSortSectionV1:pCountSortSectionV2)(array,mapper,start,endP1,section)
	}else if(sections.length>1)
		(1<<getSectionsBits(sections)<N?pCountSortSectionsV1:pCountSortSectionsV2)(array,mapper,start,endP1,sections)
}
function pCountSortPositiveV1(array,mapper,start,endP1,range){
	let i=range,j=0,c,e;
	const count=Array(i);
	for(validatePCountSortRange(i);i;)count[--i]=[];
	for(i=start;i<endP1;)count[mapper(e=array[i++])].push(e);
	for(i=start;j<range;e&&arrayCopy(c,0,array,i,e,i+=e))
		c=count[j++],e=c.length
}
function pCountSortPositiveV2(array,mapper,start,endP1,range){
	validatePCountSortRange(range);
	const count=Array(range);
	for(let i=start;i<endP1;){
		const element=array[i++], key=mapper(element);
		(count[key]||(count[key]=[])).push(element)
	}
	count.forEach((c,j)=>arrayCopy(c,0,array,start,j=c.length,start+=j))
}
function pCountSortEndingMaskV1(array,mapper,start,endP1,mask){
	const range=mask+1,count=Array(range);
	let i=range,j=0;
	for(;i;)count[--i]=[];
	for(i=start;i<endP1;){
		const element=array[i++];
		count[mapper(element)&mask].push(element);
	}
	for(i=start;j<range;i+=endP1)arrayCopy(start=count[j++],0,array,i,endP1=start.length)
}
function pCountSortEndingMaskV2(array,mapper,start,endP1,mask){
	const range=mask+1,count=Array(range);
	validatePCountSortRange(range);
	for(let i=start,e,k;i<endP1;)(count[k=mapper(e=array[i++])&mask]||(count[k]=[])).push(e);
	count.forEach((c,j)=>arrayCopy(c,0,array,start,j=c.length,start+=j))
}
function pCountSortSectionV1(array,mapper,start,endP1,section){
	const{bits,mask,shift}=section,range=1<<bits,count=Array(range);
	let i=range,j=0;
	for(validatePCountSortRange(i);i;)count[--i]=[];
	for(i=start;i<endP1;){
		const e=array[i++];
		count[(mapper(e)&mask)>>shift].push(e);
	}
	for(;j<range;){
		const e=count[j++];
		if(endP1=e.length)arrayCopy(e,0,array,start,endP1),start+=endP1
	}
}
function pCountSortSectionV2(array,mapper,start,endP1,section){
	const range=1<<section.bits;
	validatePCountSortRange(range);
	const count=Array(range);
	for(let i=start;i<endP1;){
		const element=array[i++], key=(mapper(element)&section.mask)>>section.shift;
		(count[key]||(count[key]=[])).push(element);
	}
	count.forEach((c,j)=>arrayCopy(c,0,array,start,j=c.length,start+=c.length))
}
function pCountSortSectionsV1(array,mapper,start,endP1,sections){
	const range=1<<getSectionsBits(sections);
	validatePCountSortRange(range);
	let i=range,j=0;
	const count=Array(i);
	for(;i;)count[--i]=[];
	for(i=start;i<endP1;){
		const element=array[i++];
		count[getKeySN(mapper(element),sections)].push(element);
	}
	for(i=start;j<range;){
		let c=count[j++];
		if(endP1=c.length)arrayCopy(c,0,array,i,endP1),i+=endP1
	}
}
function pCountSortSectionsV2(array,mapper,start,endP1,sections){
	const range=1<<getSectionsBits(sections);
	validatePCountSortRange(range);
	const count=Array(range);
	for(let i=start;i<endP1;){
		const element=array[i++],key=getKeySN(mapper(element),sections);
		(count[key]||(count[key]=[])).push(element)
	}
	count.forEach((c,j)=>arrayCopy(c,0,array,start,j=c.length,start+=j))
}