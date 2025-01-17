import{arrayCopy,sortObjectInt,sortObjectNumber,quickBitSorterObjectInt,pCountBitSorterObjectInt}from"../main.js";
import{testArraysEquals}from"./test-utils.js";
import{quickBitSorterObjectIntLowMem}from"../quick-bit-sorter-2-object-int.js";
console.log("Comparing Sorters");
const iterations=4;//use 20 for more accuracy in documented results
let algorithms=[
	{
		'name':'JavascriptSorter',
		'sortFunction':(array)=>{
			array.sort(function(a,b){return a.id-b.id});
			return array
		},
		'floatingPoint':true,
		'negative':true
	},
	{
		'name':'RadixBitSorterObjectIntV1V2',
		'sortFunction':(array)=>{
			sortObjectInt(array,(x)=>x.id);
			return array
		},
		'floatingPoint':false,
		'negative':true
	},
	{
		'name':'RadixBitObjectNumberSorter',
		'sortFunction':(array)=>{
			sortObjectNumber(array,(x)=>x.id);
			return array
		},
		'floatingPoint':true,
		'negative':true
	},
	{
		'name':'QuickBitObjectIntSorter',
		'sortFunction':(array)=>{
			quickBitSorterObjectInt(array,(x)=>x.id);
			return array
		},
		'floatingPoint':false,
		'negative':true
	},
	{
		'name':'PCountSorterObjectInt',
		'sortFunction':(array)=>{
			pCountBitSorterObjectInt(array,(x)=>x.id);
			return array
		},
		'floatingPoint':false,
		'negative':true,
		'range':2**21
	},
	{
		'name':'QuickBitSorterObjectIntLowMem',
		'sortFunction':(array)=>{
			quickBitSorterObjectIntLowMem(array,(x)=>x.id);
			return array
		},
		'floatingPoint':false,
		'negative':true
	},
]
let verbose=0;
let tests=[
//{"range":256,"size":128},
	{"range":1024,"size":128},
//{"range":4096,"size":128},
//{"range":65536,"size":128},
	{"range":1048576,"size":128},
	{"range":1073741824,"size":128},
//{"range":256,"size":256},
	{"range":1024,"size":256},
//{"range":4096,"size":256},
//{"range":65536,"size":256},
	{"range":1048576,"size":256},
	{"range":1073741824,"size":256},
//{"range":256,"size":512},
	{"range":1024,"size":512},
//{"range":4096,"size":512},
//{"range":65536,"size":512},
	{"range":1048576,"size":512},
	{"range":1073741824,"size":512},
//{"range":256,"size":4096},
	{"range":1024,"size":4096},
//{"range":4096,"size":4096},
//{"range":65536,"size":4096},
	{"range":1048576,"size":4096},
	{"range":1073741824,"size":4096},
//{"range":256,"size":32768},
	{"range":1024,"size":32768},
//{"range":4096,"size":32768},
//{"range":65536,"size":32768},
	{"range":1048576,"size":32768},
	{"range":1073741824,"size":32768},
//{"range":256,"size":65536},
	{"range":1024,"size":65536},
//{"range":4096,"size":65536},
//{"range":65536,"size":65536},
	{"range":1048576,"size":65536},
	{"range":1073741824,"size":65536},
//{"range":256,"size":1048576},
	{"range":1024,"size":1048576},
//{"range":4096,"size":1048576},
//{"range":65536,"size":1048576},
	{"range":1048576,"size":1048576},
	{"range":1073741824,"size":1048576},
//{"range":1000000000,"size":10000000},slow
//{"range":1000000000,"size":40000000},Out of Memory
]
//let origInt=[-488,-860,-212,-82,-35,-831,-751,-898,-329,-831,-362,-207,-862,-315,-154,-361,-141,-614,-503,-180]bug for stable
for(let test of tests){
	let range=test.range,size=test.size,generators=[
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
	for(let G of generators){
		let origArray=G.genFunction(),z=algorithms.length;
		for(let a=z;a;)algorithms[--a].totalElapsed=0;
		for(let i=0;i<iterations;i++){
			let orig=[];
			origArray.forEach(x=>orig.push({"id":x,"value":"Text"+x}));
			for(let a=0;a<z;a++){
				let A=algorithms[a];
				if(!(G.floatingPoint&&!A.floatingPoint||G.negative&&!A.negative||A.range&&A.range<range)){
					let arrayK=Array(size);
					arrayCopy(orig,0,arrayK,0,size);
					let start=performance.now();
					arrayK=A.sortFunction(arrayK);
					let elapsedP=performance.now()-start,equal=true;
					if(a){
						let arrayJS=algorithms[0]["sortedArray"];
						equal=testArraysEquals(arrayJS,arrayK,(firstError)=>{
							verbose&&console.log(`Arrays Not Equal ${A.name}+error at ${JSON.stringify(firstError)}`);
							if(verbose&&arrayJS.length<300)
								console.log("ORIG:"+JSON.stringify(origArray)),
								console.log("OK:"+JSON.stringify(arrayJS)),
								console.log("NOK:"+JSON.stringify(arrayK))
						})
					}else A["sortedArray"]=arrayK;
					if(equal)
						verbose&&console.log(`Elapsed ${A.name} time:${elapsedP} ms.`),
						A.totalElapsed+=elapsedP
				}
			}
			verbose&&console.log()
		}
		console.log();
		console.log(`AVG Times for test:${G.name}`);
		for(let a=0;a<z;){
			let A=algorithms[a++];
			if(!(G.floatingPoint&&!A.floatingPoint||G.negative&&!A.negative||A.range&&A.range<range))
				A.totalElapsed
					?console.log(`${A.name.padEnd(28)} time:${(A.totalElapsed/iterations).toFixed(6).padStart(12)} ms.`)
					:console.log(`${A.name.padEnd(28)} with errors.`);
		}
	}
}
