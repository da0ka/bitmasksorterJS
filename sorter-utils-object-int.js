import{arrayCopy,rotateRight}from"./sorter-utils.js";
export function partitionStableInt(array,i,endP1,mask,aux,mapper){
	let left=i,right=0;
	for(;i<endP1;){
		let element=array[i++];
		mapper(element)&mask?aux[right++]=element:array[left++]=element
	}
	arrayCopy(aux,0,array,left,right);
	return left
}
export function partitionStableBInt(array,start,endP1,mask,aux,mapper){
	let i=endP1,left=endP1,right=endP1=aux.length;
	for(;i>start;){
		let element=array[--i];
		mapper(element)&mask?array[--left]=element:aux[--right]=element;
	}
	arrayCopy(aux,right,array,start,endP1-right);
	return left
}
export function partitionReverseStableInt(array,i,endP1,mask,aux,mapper){
	let left=i,right=0;
	for(;i<endP1;){
		let element=array[i++];
		mapper(element)&mask?array[left++]=element:aux[right++]=element
	}
	arrayCopy(aux,0,array,left,right);
	return left
}
export function partitionReverseStableBInt(array,start,endP1,mask,aux,mapper){
	let i=endP1,left=endP1,right=endP1=aux.length;
	for(;i>start;){
		let element=array[--i];
		mapper(element)&mask?aux[--right]=element:array[--left]=element
	}
	arrayCopy(aux,right,array,start,endP1-right);
	return left
}
export function calculateMaskInt(array,i,endP1,mapper){
	let mask,inv_mask,e;
	for(;i<endP1;inv_mask|=~e)mask|=e=mapper(array[i++]);
	return mask&inv_mask
}
export function partitionStableLowMemInt(array,start,endP1,mask,mapper,aux){
///Skip what is already sorted
	while(start<endP1&&!(mapper(array[start])&mask))start++;
	let i=endP1;
	for(;--i>start&&mapper(array[i])&mask;);
	if(i-start<1)return start;
	if(!aux)aux=Array(1);
///Stable Partition with Buffer
	generateWhiteBlackBlocksAndMerge(array,start,endP1=i+1,mask,mapper,aux,true);
///Test first element
	if(mapper(array[i=start])&mask){
		while(mapper(array[++i])&mask&&i<endP1);
//rotate to get white first
		rotateRight(array,start,endP1,endP1-=i);
		return start+endP1
	}
	while(i<endP1&&!(mapper(array[i])&mask))i++;
	return i
}
export function partitionReverseStableLowMemInt(array,start,endP1,mask,mapper,aux){
///Skip what is already sorted
	while(start<endP1&&mapper(array[start])&mask)start++;
	let i=endP1;
	while(--i>start&&!(mapper(array[i])&mask));
	if(i-start<1)return start;
	if(!aux)aux=Array(1);
///Stable Partition with Buffer
	generateWhiteBlackBlocksAndMerge(array,start,endP1=i+1,mask,mapper,aux,false);
///Test first element
	if(mapper(array[i=start])&mask){
		while(mapper(array[++i])&mask&&i<endP1);
		return i
	}
	while(i<endP1&&!(mapper(array[i])&mask))i++;
//rotate to get black first
	rotateRight(array,start,endP1,endP1-=i);
	return start+endP1
}
function generateWhiteBlackBlocksAndMerge(array,start,endP1,mask,mapper,aux,whiteBefore){
//generate black/white or white/black blocks with aux buffer
	let bufferSize=aux.length, i=start, res;
	for(;i<endP1;whiteBefore^=1){
		let white=0,black=0,j=i;
		for(;j<endP1;){
			if(mapper(array[j++])&mask){
				if(Math.min(++black,white)>bufferSize){
					black--;break
				}
			}else if(Math.min(black,++white)>bufferSize){
				white--;break
			}
		}
		res=white>black
			?whiteBefore
//white-white-black-->
				?partitionStableInt(array,i,j,mask,aux,mapper)
//black-black-white<--
				:partitionReverseStableBInt(array,i,j,mask,aux,mapper)
			:whiteBefore
//white-white-black<--
				?partitionStableBInt(array,i,j,mask,aux,mapper)
//black-black-white-->
				:partitionReverseStableInt(array,i,j,mask,aux,mapper);
		if(i===start&&j===endP1)return res;
		i=j
	}
//merge blocks
//repeat until there are 3 blocks(white,black,white)(black,white,black)
//W W
//WBWBWBWBWBWBWBWB
//W
//WB
//WBW
//WBWB
//WBWBW
//WBWBW
//WWBBW
//WBW
	let nshifts=0;
	for(i=start;i<endP1;)
		if(mapper(array[i])&mask){
			let black1Start=i++;
			while(i<endP1&&mapper(array[i])&mask)i++;
			let whiteStart=i;
			while(i<endP1&&(mapper(array[i])&mask)===0)i++;
			if(i===whiteStart&&nshifts<=1)break;
			let black2Start=i;
			while(i<endP1&&mapper(array[i])&mask)i++;
			if(i===black2Start&&!nshifts)break;
			rotateRight(array,whiteStart,i,i-black2Start);
//swap black with white2;
			nshifts++;
			if(i===endP1){
				if(black1Start===start)break;
//start another round
				i=start;nshifts=0
			}
//WWBBBWWW
//WWWWWBBB
		}else{
			let white1Start=i++;
			while(i<endP1&&(mapper(array[i])&mask)===0)i++;
			let blackStart=i;
			while(i<endP1&&mapper(array[i])&mask)i++;
			if(i===blackStart&&nshifts<=1)break;
			let white2Start=i;
			while(i<endP1&&(mapper(array[i])&mask)===0)i++;
			if(i===white2Start&&!nshifts)break;//TODO  CHECK<=1 this works but the other don't
			rotateRight(array,blackStart,i,i-white2Start);
//swap black with white2;
			nshifts++;
			if(i===endP1){
				if(white1Start===start)break;
//start another round
				i=start;nshifts=0;
			}
//WWBBBWWW
//WWWWWBBB
		}
}