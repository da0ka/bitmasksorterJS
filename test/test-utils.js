export function testArraysEquals(expected,current,f){
	let firstError=null;
	let equal=expected.length===current.length&&current.every(function(value,index){
		if(value===expected[index])return true;
		if(!firstError)
			firstError={"index":index,"expected":expected[index],"current":current[index]};
		return false
	});
	equal||f&&f(firstError);
	return equal
}