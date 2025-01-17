import{getMaskAsArray}from"./sorter-utils.js";
export function calculateMaskNumber(array,i,endP1){
	let pMask0=0,invMask0=0,pMask1=0,invMask1=0;
	for(;i<endP1;){
		let ei1=2*i++,ei0=array[ei1];ei1=array[ei1+1];
		pMask0=pMask0|ei0;
		invMask0=invMask0|~ei0;
		pMask1=pMask1|ei1;
		invMask1=invMask1|~ei1;
	}
	return[pMask0&invMask0,pMask1&invMask1]
}
export function getMaskAsArrayNumber(masks){
	return[getMaskAsArray(masks[0]),getMaskAsArray(masks[1])];
}