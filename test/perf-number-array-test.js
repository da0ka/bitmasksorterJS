import{arrayCopy,pCountBitSorterInt,quickBitSorterInt,sortInt,sortNumber}from"../main.js";
import{testArraysEquals}from"./test-utils.js";
import{aFlagBitSorterInt}from"../a-flag-bit-sorter-int.js";
console.log("Comparing Sorters\n");
const iterations=4;//use 20 for more accuracy in documented results
let algorithms=[
	{
		'name':'JavaScriptSorter',
		'sortFunction':array=>{
			array.sort(function(a,b){return a-b});
			return array
		},
		'floatingPoint':true,
		'negative':true
	},
	{
		'name':'QuickBitSorterInt',
		'sortFunction':array=>{
			quickBitSorterInt(array);
			return array
		},
		'floatingPoint':false,
		'negative':true
	},
	{
		'name':'RadixBitSorterInt',
		'sortFunction':array=>{
			sortInt(array);
			return array
		},
		'floatingPoint':false,
		'negative':true
	},
	{
		'name':'RadixBitSorterNumber',
		'sortFunction':array=>{
			sortNumber(array);
			return array
		},
		'floatingPoint':true,
		'negative':true
	},
	{
		'name':'PCountBitSorterInt',
		'sortFunction':array=>{
		   pCountBitSorterInt(array);
		   return array
		},
		'floatingPoint':false,
		'negative':true,
		'range':2**21
	},
	{
		'name':'Float64Array.sort',
		'sortFunction':array=>new Float64Array(array).sort(),
		'floatingPoint':true,
		'negative':true
	},
	{
		'name':'AFlagBitSorterInt',
		'sortFunction':array=>{
			aFlagBitSorterInt(array);
			return array
		},
		'floatingPoint':false,
		'negative':true
	}
],last=algorithms.length,
verbose=false,
tests=[
	{"range":1000,"size":1000000},
	{"range":1000000,"size":1000000},
	{"range":1000000000,"size":1000000},
	//{"range":1000000000,"size":40000000}
];
for(let test of tests){
	let range=test.range, size=test.size, generators=[
		{
			"name":`Positive Integer Numbers,range:${range},size:${size}`,
			"genFunction":()=>Array.from({length:size},()=>Math.floor(Math.random()*range)),
			"negative":false,
			"floatingPoint":false
		},
		{
			"name":`Negative Integer Numbers,range:${range},size:${size}`,
			"genFunction":()=>Array.from({length:size},()=>-Math.floor(Math.random()*range)),
			"negative":true,
			"floatingPoint":false
		},
		{
			"name":`Negative/Positive Integer Numbers,range:${range},size:${size}`,
			"genFunction":()=>Array.from({length:size},()=>Math.floor(Math.random()*range-range/2)),
			"negative":true,
			"floatingPoint":false
		},
		{
			"name":`Negative/Positive Floating Point Numbers,range:${range},size:${size}`,
			"genFunction":()=>Array.from({length:size},()=>Math.random()*range-range/2),
			"negative":true,
			"floatingPoint":true
		}
	];
	for(let generator of generators){
		let origArray=generator.genFunction();
		for(let a=last;a;){
			let algorithm=algorithms[--a];
			algorithm.totalElapsed=algorithm.iterations=0
		}
		for(let i=iterations;i--;){
			for(let a=0;a<last;){
				let algorithm=algorithms[a++];
				if(!(generator.floatingPoint&&!algorithm.floatingPoint||generator.negative&&!algorithm.negative||algorithm.range&&algorithm.range<range)){
					let arrayK=Array(size),equal=true;
					arrayCopy(origArray,0,arrayK,0,size);
					let elapsedP=performance.now();
					arrayK=algorithm.sortFunction(arrayK);
					elapsedP=performance.now()-elapsedP;
					if(a){
						let arrayJS=algorithms[0]["sortedArray"];
						equal=testArraysEquals(arrayJS,arrayK,(firstError)=>{
							verbose&&console.log(`Arrays Not Equal ${algorithm.name}+error at ${JSON.stringify(firstError)}`);
							if(verbose&&arrayJS.length<300)
								console.log("ORIG:"+JSON.stringify(origArray)),
								console.log("OK:"+JSON.stringify(arrayJS)),
								console.log("NOK:"+JSON.stringify(arrayK))
						})
					}else algorithm["sortedArray"]=arrayK;
					if(equal)
						verbose&&console.log(`Elapsed ${algorithm.name} time:${elapsedP} ms.`),
						algorithm.totalElapsed+=elapsedP,
						algorithm.iterations++
				}
			}
			verbose&&console.log()
		}
		console.log();
		console.log(`AVG Times for test:${generator.name}`);
		for(let a=0;a<last;){
			let algorithm=algorithms[a++];
			if(!(generator.floatingPoint&&!algorithm.floatingPoint||generator.negative&&!algorithm.negative||algorithm.range&&algorithm.range<range))
				algorithm.totalElapsed
					?console.log(`${algorithm.name.padEnd(28)} time:${(algorithm.totalElapsed/iterations).toFixed(6).padStart(12)} ms.`)
					:console.log(`${algorithm.name.padEnd(28)} with errors.`)
		}
	}
}