import{arrayCopy,calculateSumOffsets,getSections}from"./sorter-utils.js";
import{calculateMaskNumber,getMaskAsArrayNumber}from"./sorter-utils-number.js";
export function radixBitSorterObjectNumber(arrayObj,mapper,start,endP1){
	if(!start)start=0;
	if(!endP1)endP1=arrayObj.length;
	let n=endP1-start;
	if(n<2)return;
	let arrayFloat64=new Float64Array(n), j=0, nulls=0, p=0, undefinedValues=0, nans=[];
	for(let i=start;i<endP1;i++){
		let e=arrayObj[i];
		if(e===null){nulls++;continue}
		if(e===undefined){undefinedValues++;continue}
		if(isNaN(e=mapper(e))){nans[p++]=e;continue}
		if(i>j)arrayObj[j]=e;
		arrayFloat64[j++]=e
	}
	arrayCopy(nans,0,arrayObj,j,p);
	for(j+=p;nulls;nulls--)arrayObj[j++]=null;
	for(;undefinedValues;undefinedValues--)arrayObj[j++]=undefined;
	let arrayInt32=new Int32Array(arrayFloat64.buffer),//[0]=lower 32 bits,[1]higher 32 bits
		bList=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,start,endP1-=p+nulls+undefinedValues,mapper));
	if(!bList[0].length&&!bList[1].length)return;
	let auxFloat64=new Float64Array(n), auxObj=Array(n).fill(null);
	if(bList[1].length&&bList[1][0]===31){//there are negative numbers and positive numbers
		let finalLeft=partitionReverseStableNumber(arrayInt32,arrayFloat64,arrayObj,start,endP1,1<<31,1,auxFloat64,auxObj);
		if(finalLeft-start>1)//sort negative numbers
			bList=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,start,finalLeft)),
			(bList[0].length||bList[1].length)&&radixSortNumber(false,arrayInt32,arrayFloat64,arrayObj,start,finalLeft,bList,auxFloat64,auxObj)
		if(endP1-finalLeft>1)//sort positive numbers
			bList=getMaskAsArrayNumber(calculateMaskNumber(arrayInt32,finalLeft,endP1)),
			(bList[0].length||bList[1].length)&&radixSortNumber(true,arrayInt32,arrayFloat64,arrayObj,finalLeft,endP1,bList,auxFloat64,auxObj)
	}else arrayInt32[1]&1<<31
		?radixSortNumber(!1,arrayInt32,arrayFloat64,arrayObj,start,endP1,bList,auxFloat64,auxObj)
		:radixSortNumber(!0,arrayInt32,arrayFloat64,arrayObj,start,endP1,bList,auxFloat64,auxObj)
}
function radixSortNumber(asc,arrayI32,arrayF64,arrayObj,start,endP1,bList,auxF64,auxObj){
	for(let e=0;e<2;e++)
		for(let i=0,sections=getSections(bList[e]),l=sections.length;i<l;){
			let{bits,shift,mask}=sections[i++];
			if(bits===1)asc
				?partitionStableNumber(arrayI32,arrayF64,arrayObj,start,endP1,mask,e,auxF64,auxObj)
				:partitionReverseStableNumber(arrayI32,arrayF64,arrayObj,start,endP1,mask,e,auxF64,auxObj);
			else bits=1<<bits,shift
				?partitionStableGroupBitsNumber(asc,arrayI32,arrayF64,arrayObj,start,endP1,mask,e,shift,bits,auxF64,auxObj)
				:partitionStableLastBitsNumber(asc,arrayI32,arrayF64,arrayObj,start,endP1,mask,e,bits,auxF64,auxObj)
		}
}
function partitionReverseStableNumber(arrayI32,arrayF64,arrayObj,start,endP1,mask,elementIndex,auxF64,auxObj){
	let i=start,left=start,right=0;
	for(;i<endP1;){
		let f=arrayF64[i],o=arrayObj[i];
		if(arrayI32[i++*2+elementIndex]&mask)
			arrayF64[left]=f,arrayObj[left++]=o;
		else auxF64[right]=f,auxObj[right++]=o
	}
	arrayCopy(auxF64,0,arrayF64,left,right);
	arrayCopy(auxObj,0,arrayObj,left,right);
	return left
}
function partitionStableNumber(arrayI32,arrayF64,arrayObj,start,endP1,mask,elementIndex,auxF64,auxObj){
	let i=start,left=start,right=0;
	for(;i<endP1;){
		let f=arrayF64[i],o=arrayObj[i];
		if(arrayI32[i++*2+elementIndex]&mask)
			auxF64[right]=f,auxObj[right++]=o;
		else arrayF64[left]=f,arrayObj[left++]=o
	}
	arrayCopy(auxF64,0,arrayF64,left,right);
	arrayCopy(auxObj,0,arrayObj,left,right);
	return left
}
function partitionStableLastBitsNumber(asc,arrayI32,arrayF64,arrayObj,start,endP1,mask,elementIndex,dRange,auxF64,auxObj){
	let i=start,n=endP1-i,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[arrayI32[i++*2+elementIndex]&mask]++;
	calculateSumOffsets(asc,count,dRange);
	for(i=start;i<endP1;){
		let index=count[arrayI32[i*2+elementIndex]&mask]++, e=arrayF64[i], o=arrayObj[i++];
		auxF64[index]=e;auxObj[index]=o
	}
	arrayCopy(auxF64,0,arrayF64,start,n);
	arrayCopy(auxObj,0,arrayObj,start,n)
}
function partitionStableGroupBitsNumber(asc,arrayI32,arrayF64,arrayObj,start,endP1,mask,elementIndex,shiftRight,dRange,auxF64,auxObj){
	let i=start,n=endP1-i,count=new(n>>15?Uint32Array:n>>7?Uint16Array:Uint8Array)(dRange);
	for(;i<endP1;)count[(arrayI32[i++*2+elementIndex]&mask)>>>shiftRight]++;
	calculateSumOffsets(asc,count,dRange);
	for(i=start;i<endP1;){
		let index=count[(arrayI32[i*2+elementIndex]&mask)>>>shiftRight]++, e=arrayF64[i], o=arrayObj[i++];
		auxF64[index]=e;auxObj[index]=o
	}
	arrayCopy(auxF64,0,arrayF64,start,n);
	arrayCopy(auxObj,0,arrayObj,start,n)
}