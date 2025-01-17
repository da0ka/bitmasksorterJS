import{arrayCopy,calculateSumOffsets,getMaskAsArray,getSections}from"./sorter-utils.js";
import{calculateMaskInt}from"./sorter-utils-int.js";
export function radixBitSorterObjectIntV2(arrayObj,mapper,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=arrayObj.length;
	let n=endP1-start;
	if(n<2)return;
	let arrayInt32=new Int32Array(n),j=0,nulls=n=0,undefinedValues=0,nans=[];
	for(let i=start;i<endP1;i++){
		let e=arrayObj[i];
		if(e===null){nulls++;continue}
		if(e===undefined){undefinedValues++;continue}
		if(isNaN(e=mapper(e))){nans[n++]=e;continue}
		if(i>j)arrayObj[j]=e;
		arrayInt32[j++]=e
	}
	arrayCopy(nans,0,arrayObj,j,n);
	for(j+=n;nulls;nulls--)arrayObj[j++]=null;
	for(;undefinedValues;undefinedValues--)arrayObj[j++]=undefined;
	let mask=calculateMaskInt(arrayInt32,start,endP1-=n+nulls+undefinedValues);
	if(!mask)return;
	let bList=getMaskAsArray(mask), auxInt32=new Int32Array(n=endP1-start), auxObj=Array(n).fill(null);
	if(bList[0]^31)return radixSortObjectI32(true,arrayInt32,arrayObj,start,endP1,bList,auxInt32,auxObj);
	//there are negative numbers and positive numbers
	let finalLeft=partitionReverseStableObjectI32(arrayInt32,arrayObj,start,endP1,1<<31,auxInt32,auxObj),
		n1=finalLeft-start, n2=endP1-finalLeft;
	if(n1>1)//sort negative numbers
		bList=getMaskAsArray(calculateMaskInt(arrayInt32,start,finalLeft)),
		bList.length&&radixSortObjectI32(true,arrayInt32,arrayObj,start,finalLeft,bList,auxInt32,auxObj);
	if(n2>1)//sort positive numbers
		bList=getMaskAsArray(calculateMaskInt(arrayInt32,finalLeft,endP1)),
		bList.length&&radixSortObjectI32(true,arrayInt32,arrayObj,finalLeft,endP1,bList,auxInt32,auxObj)
}
function radixSortObjectI32(asc,arrayI32,arrayObj,start,endP1,bList,auxI32,auxObj){
	for(let i=0,sections=getSections(bList),l=sections.length;i<l;){
		let{bits,shift,mask}=sections[i++];
		if(bits===1)asc
			?partitionStableObjectI32(arrayI32,arrayObj,start,endP1,mask,auxI32,auxObj)
			:partitionReverseStableObjectI32(arrayI32,arrayObj,start,endP1,mask,auxI32,auxObj);
		else bits=1<<bits,shift
			?partitionStableGroupBitsObjectI32(asc,arrayI32,arrayObj,start,endP1,mask,shift,bits,auxI32,auxObj)
			:partitionStableLastBitsObjectI32(asc,arrayI32,arrayObj,start,endP1,mask,bits,auxI32,auxObj)
	}
}
function partitionReverseStableObjectI32(arrayI32,arrayObj,start,endP1,mask,auxI32,auxObj){
	let i=start,left=start,right=0;
	for(;i<endP1;){
		let element=arrayI32[i],elementObj=arrayObj[i++];
		if(element&mask)
			arrayI32[left]=element,arrayObj[left++]=elementObj;
		else auxI32[right]=element,auxObj[right++]=elementObj
	}
	arrayCopy(auxI32,0,arrayI32,left,right);
	arrayCopy(auxObj,0,arrayObj,left,right);
	return left
}
function partitionStableObjectI32(arrayI32,arrayObj,start,endP1,mask,auxI32,auxObj){
	let i=start,left=start,right=0;
	for(;i<endP1;){
		let element=arrayI32[i],elementObj=arrayObj[i++];
		if(element&mask)
			auxI32[right]=element,auxObj[right++]=elementObj;
		else arrayI32[left]=element,arrayObj[left++]=elementObj
	}
	arrayCopy(auxI32,0,arrayI32,left,right);
	arrayCopy(auxObj,0,arrayObj,left,right);
	return left
}
function partitionStableLastBitsObjectI32(asc,arrayI32,arrayObj,start,endP1,mask,dRange,auxI32,auxObj){
	let i=start,n=endP1-i,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[arrayI32[i++]&mask]++;
	calculateSumOffsets(asc,count,dRange);
	for(i=start;i<endP1;){
		let e=arrayI32[i], o=arrayObj[i++], index=count[e&mask]++;
		auxI32[index]=e;auxObj[index]=o
	}
	arrayCopy(auxI32,0,arrayI32,start,n);
	arrayCopy(auxObj,0,arrayObj,start,n)
}
function partitionStableGroupBitsObjectI32(asc,arrayI32,arrayObj,start,endP1,mask,shiftRight,dRange,auxI32,auxObj){
	let i=start,n=endP1-i,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[(arrayI32[i++]&mask)>>>shiftRight]++;
	calculateSumOffsets(asc,count,dRange);
	for(i=start;i<endP1;){
		let e=arrayI32[i], o=arrayObj[i++], index=count[(e&mask)>>>shiftRight]++;
		auxI32[index]=e;auxObj[index]=o;
	}
	arrayCopy(auxI32,0,arrayI32,start,n);
	arrayCopy(auxObj,0,arrayObj,start,n)
}