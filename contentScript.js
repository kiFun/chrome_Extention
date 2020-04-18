var $=document;

const colorContent=function(clname){
	let c=$.getElementsByClassName(clname);
	for(let i=0;i<c.length;i++){
		c[i].style.color="#FFFFFF";
		c[i].style.backgroundColor="#0000FF";
	}
}
const uncolorContent=function(clname){
let c=$.getElementsByClassName(clname);
for (let i=0;i<c.length;i++){
	c[i].style.backgroundColor="";
	c[i].style.color="";
}
}

const addCol1=function(e){
	colorContent(e.target.className);
}
const addCol2=function(e){
	uncolorContent(e.target.className);
}
const addCol3=function(e){
	e.preventDefault();
	uncolorContent(e.target.className);
	chrome.runtime.sendMessage({type:"cmd",b:{cType:"addCol",other:e.target.className}},function(resp){});
	let c=$.getElementsByTagName("div");
	for(let i=0;i<c.length;++i){
		c[i].removeEventListener("mouseover",addCol1);
		c[i].removeEventListener("mouseout",addCol2);
		c[i].removeEventListener("click",addCol3);
	}
}

const showCol1=function(e){
	e.preventDefault();
	chrome.runtime.sendMessage({type:"cmd",b:{cType:"removeCol",other:e.target.className}},(r)=>{});
	uncolorContent(e.target.className);
	let c=$.getElementsByClassName(e.target.className);
	for(let i=0;i<c.length;++i){
		c[i].removeEventListener("dblclick", showCol1);
	}
}

const addNextPage=function(e){
	e.preventDefault();
	uncolorContent(e.target.className);
	let c=[...$.getElementsByTagName("a"),...$.getElementsByTagName("link")];
	chrome.runtime.sendMessage({type:"cmd",b:{cType:"addNextPage",other:e.target.className, inner:e.target.innerText}},(r)=>{})
	for(let i = 0;i<c.length;++i){
		c[i].removeEventListener("mouseover",addCol1,false);
		c[i].removeEventListener("mouseout",addCol2);
		c[i].removeEventListener("click",addNextPage);
	}
}

function intersection(a,b){
	for(let i=0;i<a.length;i++){
		for(let j=0;j<b.length;j++){
			if(a[i]==b[j]) return true;
		}
	}
	return false;
}

function commonParent(a1,b1){
let a=$.getElementsByClassName(a1)[0];
let b=$.getElementsByClassName(b1)[0];
let c1=[];
c1.push(a.className);
let c2=[];
c2.push(b.className);
while(!intersection(c1,c2)){
	c1.push(a.parentNode.className);
	c2.push(b.parentNode.className);
	a=a.parentNode;
	b=b.parentNode;
}
for(let i=0;i<c1.length;i++){
	if(c2[c2.length-1]==c1[i]){
		return(c2[c2.length-1]);
	}
}
for(let i=0;i<c2.length;i++){
	if(c1[c1.length-1]==c2[i]){
		return(c1[c1.length-1]);
	}
}
return 0;
}

function genString(cols){
if(cols.length>1){
	let a=commonParent(cols[0],cols[1]);
	for(let i=2;i<cols.length;i++){
		b=commonParent(a,cols[i]);
		a=(b==document.body||b==document)?a:b;
	}
	return a;
}else if(cols.length==1){
	return (cols[0]);
} else{
	return 0;
}
}

function gotoNextPage(){
	chrome.runtime.sendMessage({type:"get",b:"search"},(resp)=>{
		if (resp.type=="pl") $.location.href=resp.b;
		else if (resp.type=="np"){
			let a=$.getElementsByClassName(resp.b);
			if (a.tagName=="a"||a.tagName=="link") $.location.href=a.href;
			else a.onclick();
		}
	});
}

window.onload=function(){
	chrome.runtime.sendMessage({type:"checkPages",b:$.location.href},function(resp){});
	chrome.runtime.onMessage.addListener(function(req,s,resp){
		if(req.type=="cmd"){
			if(req.b.cType=="addCol"){
				if(req.b.other){
					let c=$.getElementsByTagName("div");
					for(let i=0;i<c.length;++i){
						c[i].addEventListener("mouseover",addCol1,false);
						c[i].addEventListener("mouseout",addCol2,false);
						c[i].addEventListener("click",addCol3,false);
					}
				}else{
					let c=$.getElementsByTagName("div");
					for(let i=0;i<c.length;++i){
						c[i].removeEventListener("mouseover",addCol1);
						c[i].removeEventListener("mouseout",addCol2);
						c[i].removeEventListener("click",addCol3);
					}
				}
				resp();
			} else if(req.b.cType=="showCols"){
				for(let i = 0;i<req.b.other.length;++i){
					colorContent(req.b.other[i]);
					let c=$.getElementsByClassName(req.b.other[i]);
					for(let j=0;j<c.length;++j){
						c[j].addEventListener("dblclick", showCol1,false);
					}
				}
				resp();
			} else if(req.b.cType=="hideCols"){
				for(let i = 0;i<req.b.other.length;++i){
					uncolorContent(req.b.other[i]);
					let c=$.getElementsByClassName(req.b.other[i]);
					for(let j=0;j<c.length;++j){
						c[j].removeEventListener("dblclick", showCol1);
					}
				}
				resp();
			} else if(req.b.cType=="addNextPage"){
				let c=[...$.getElementsByTagName("a"),...$.getElementsByTagName("link")];
				for(let i=0;i<c.length;++i){
					c[i].addEventListener("mouseover",addCol1,false);
					c[i].addEventListener("mouseout",addCol2,false);
					c[i].addEventListener("click",addNextPage,false);
				}
				resp();
			}else if(req.b.cType=="cAddNextPage"){
				let c=[...$.getElementsByTagName("a"),...$.getElementsByTagName("link")];
				for(let i=0;i<c.length;++i){
					c[i].removeEventListener("mouseover",addCol1);
					c[i].removeEventListener("mouseout",addCol2);
					c[i].removeEventListener("click",addNextPage);
				}
				resp();
			}else if(req.b.cType=="showNextPage"){
				colorContent(req.b.other);
				resp();
			}else if(req.b.cType=="hideNextPage"){
				uncolorContent(req.b.other);
				resp();
			}
		}else if(req.type=="search"){
			let d=genString(req.b);
			let c=$.getElementsByClassName(d);
			let c1 = [];
			for(let i=0;i<c.length;++i){
				c1.push([]);
				for(j=0;j<req.b.length;++j){
					c1[i].push((c[i].className==req.b[j])?c[i].innerText:c[i].getElementsByClassName(req.b[j])[0].innerText);
				}
			}
			resp({b:c1});
		}else if(req.type=="nextPageNP"){
			let a=$.getElementsByClassName(req.b);
			if(a.length==0){
				resp({b:false});
			}
			else{
				for(let i=0;i<a.length;++i){
					if (a[i].innerText==req.other){
						let resp1=function(r){
							return new Promise((res,rej)=>{
								r({b:true});
								res();
							});
						}
						resp1(resp).then($.location.href=a[i].href);
					}
				}
				resp({b:false});
			}
			resp({b:true});
		}
	});
};