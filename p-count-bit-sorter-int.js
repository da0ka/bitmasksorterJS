import{getMaskAsArray,getSections}from"./sorter-utils.js";
import{calculateMaskInt,partitionReverseNotStableUpperBit}from"./sorter-utils-int.js";

let COUNT_SORT_ERROR_SHOWED = false
const COUNT_SORT_ERROR = "Pigeonhole Count sort should be used for number range <= 2**24, for optimal performance: range <= 2**20"

export function pCountBitSorterInt(array, start, endP1, bList, bListStart){
	if(!start)start = 0;
	if(!endP1)endP1 = array.length;
	if(!bList)bList = getMaskAsArray(calculateMaskInt(array, start, endP1)),bListStart = 0;
	if(bList[bListStart]===31){//there are negative numbers and positive numbers
		bListStart=partitionReverseNotStableUpperBit(array,start,endP1);
		bListStart-start>1&&pCountBitSorterInt(array,start,bListStart);//sort negative numbers
		return endP1-bListStart>1&&pCountBitSorterInt(array,bListStart,endP1)//sort positive numbers
	}
	let sections = getSections(bList.slice(bListStart),32);
	if(sections.length === 1){
		let section = sections[0],shift = section.shift;
		if(shift === 0){
			let mask = section.mask,elementSample = array[start] & ~mask;
			elementSample? //last bits but there is a mask for a bigger number
				pCountSortEndingMask(array, start, endP1, mask, elementSample):
				//last bits and includes all numbers and all positive numbers
				pCountSortPositive(array, start, endP1, 1 << section.bits)
		}else pCountSortSection(array, start, endP1, section);
	}else sections.length > 1&&pCountSortSections(array, start, endP1, sections)
}
/*
Pigeonhole count sort is destructive count sort as it reconstructs(rebuilds)
the int numbers, no swaps, reverse or aux arrays.
Faster sorter when the following conditions are met:
when max-min(range <= 2**19 is faster than radixBitSorterInt)
when max-min(range < 2**25 is faster than javascript sorter)
when max-min(range = 2**25 has similar performance than javascript sorter)
when max-min(range > 2**25 is slower than javascript sorter) and when n(endP1-start)2^17..2^20(other ranges not tested yet)
*/
export function pCountNoMaskSorterInt(array, start, endP1, min, max){
	if(!start)start = 0;
	if(!endP1)endP1 = array.length;
	if(endP1 - start < 2)return;
	if(!min || !max){
		min = array[start];max = array[start];
		for(let i = start;++i < endP1;){
			let value = array[i];
			if(value < min)min = value;
			if(value > max)max = value
		}
	}
	let range = max - min + 1;
	validatePCountSortRange(range);
	if(!Number.isInteger(range))return console.error("Pigeonhole Count sort only works on integers");
	let i = start,j = min,count = Array(range).fill(0);
	for(; i < endP1;)count[array[i++] - min]++
	for(i = start;j <= max; j++){
		let c = count[j - min];
		if(c>0){
			for(;array[i++] = j,--c;);
			if(i === endP1)break
		}
	}
}
function pCountSortPositive(array, start, endP1, range){
	validatePCountSortRange(range);
	let count = Array(range).fill(0);
	for(let i = start; i < endP1;)count[array[i++]]++;
	for(let i = start,j = -1;j<range;){
		let c = count[++j];
		if(c>0){
			for(;array[i++] = j,--c;);
			if(i === endP1)break
		}
	}
}
function pCountSortEndingMask(array, start, endP1, mask, elementSample){
	let range = mask + 1;
	validatePCountSortRange(range);
	let i = start,j = 0,count = Array(range).fill(0);
	for(;i < endP1;)count[array[i++] & mask]++;
	for(i = start;j<range; j++){
		let c = count[j];
		if(c>0){
			for(let value = j | elementSample;array[i++] = value,--c;);
			if(i === endP1)break
		}
	}
}
function pCountSortSection(array, start, endP1, section){
	let i = start,j=-1,range = 1 << section.bits,count = Array(range).fill(0),number = Array(range),mask = section.mask;
	validatePCountSortRange(range);
	for(; i < endP1;){
		let element = array[i++],key =(element & mask)>> section.shift;
		count[key]++;
		number[key] = element
	}
	for(i = start;j<range;){
		let c = count[++j];
		if(c>0){
			for(let value = number[j];array[i++] = value,--c;);
			if(i === endP1)break
		}
	}
}
function pCountSortSections(array, start, endP1, sections){
	let i = start,j=-1,range = 1 << getSectionsBits(sections),count = Array(range).fill(0),number = Array(range);
	validatePCountSortRange(range);
	for(; i < endP1;){
		let element = array[i++],key = getKeySN(element, sections);
		count[key]++;
		number[key] = element
	}
	for(i = start;j<range;){
		let c = count[++j];
		if(c>0){
			for(let value = number[j];array[i++] = value,--c;);
			if(i === endP1)break
		}
	}
}
//Maybe this could be useful when n is short compared to range, Maybe not as better algorithms are available
function pCountSortSectionsSparse(array, start, endP1, sections){
	let range = 1 << getSectionsBits(sections),count = [],number = [];
	validatePCountSortRange(range);
	for(let i = start; i < endP1; i++){
		let element = array[i],key = getKeySN(element, sections);
		count[key] = count[key] ? count[key] + 1 : 1;
		number[key] = element
	}
	let i = start;
	count.forEach((c,j)=>{
		for(let value = number[j];c--;)array[i++] = value
	})
}
export function getKeySN(element, sections){
	let result = 0;
	for(let i = sections.length;i;){ //TODO CHECK THIS LINE, IN JAVA IMPLEMENTATION IS THE OPPOSITE DIRECTION
		let section = sections[--i],bits =(element & section.mask)>> section.shift;
		result = result << section.bits | bits;
	}
	return result
}
export function getSectionsBits(sections){
	let bits = 0;
	for(let s = sections.length;s;)bits += sections[--s].bits;
	return bits
}
export function validatePCountSortRange(range){
	if(range>1<<24&&!COUNT_SORT_ERROR_SHOWED)
		console.error(COUNT_SORT_ERROR),COUNT_SORT_ERROR_SHOWED = true;
}
