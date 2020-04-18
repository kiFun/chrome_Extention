//background

var $=document;//shortcut

var lang;
var tabID;

var d={//data
	nextPage:0,
	cols:new Set(),
	tabRow:0,
	results:new Set(),
	search:"",
	inner:""
}

const runSearch=function(){
	let c=[];
	d.cols.forEach(i=>c.push(i));
	chrome.tabs.sendMessage(tabID,{type:"search",b:c},(r)=>{
		for(let j=0;j<r.b.length;++j){
			d.results.add(r.b[j]);
		}
		chrome.tabs.sendMessage(tabID,{type:"nextPageNP",b:d.nextPage,other:d.inner},r1=>{
			if(r1.b==false){
				d.search=false;
				let c=[]
				d.results.forEach(i=>c.push(i));
				chrome.runtime.sendMessage({type:"download",b:c},r=>{})
			};
		});
	});
}

chrome.runtime.onMessage.addListener(function(req,sender,resp){
	if(req.type=="get"){//listens popupS, inits var search
		if(req.b=="winInit"){
			if(d.search=="")d.search=false;
			resp({isSearching:d.search});
		}
	}else if(req.type=="checkPages"){//listens contentS and inits var tabID
		tabID=sender.tab.id;
		if(d.search)runSearch();
		resp();
	}else if(req.type=="winState"){//listens popupS; change state
		if(req.b.el=="search"){
			d.search=req.b.state;
			if(d.search)runSearch();
		}else if(req.b.el=="lang"){
			lang=req.b.state;
		}
		resp();
	}else if(req.type=="cmd"){
		if(req.b.cType=="addCol"){//adds column to table
			if(sender.url=="chrome-extension://"+chrome.runtime.id+"/popup.html"){
				chrome.tabs.sendMessage(tabID,req);
				resp();
			}else{
				d.cols.add(req.b.other);
				chrome.runtime.sendMessage({type:"toPopup",b:{t:"colAdded"}},function(resp1){});
				resp();
			}
		} else if(req.b.cType=="showCols"){
			let a=[];
			d.cols.forEach(i=>a.push(i));
			chrome.tabs.sendMessage(tabID,{type:"cmd",b:{cType:"showCols",other:a}},(r)=>{});
			resp();
		} else if(req.b.cType=="removeCol"){
			d.cols.delete(req.b.other);
			resp();
		} else if(req.b.cType=="hideCols"){
			let a=[];
			d.cols.forEach(i=>a.push(i));
			chrome.tabs.sendMessage(tabID,{type:"cmd",b:{cType:"hideCols",other:a}},(r)=>{});
			resp();
		} else if(req.b.cType=="addNextPage"){
			if(sender.url=="chrome-extension://"+chrome.runtime.id+"/popup.html"){
				chrome.tabs.sendMessage(tabID,req,(r)=>{});
			}else{
				d.nextPage=req.b.other;
				d.inner=req.b.inner;
			}
			resp();
		}else if(req.b.cType=="cAddNextPage"){//cancelAddNextPage
			chrome.tabs.sendMessage(tabID,{type:"cmd",b:{cType:"cAddNextPage"}},(r)=>{});
			resp();
		} else if(req.b.cType=="showNextPage"){
			chrome.tabs.sendMessage(tabID,{type:"cmd",b:{cType:"showNextPage",other:d.nextPage}},(r)=>{});
			resp();
		}else if(req.b.cType=="hideNextPage"){
			chrome.tabs.sendMessage(tabID,{type:"cmd",b:{cType:"hideNextPage",other:d.nextPage}},(r)=>{});
			resp();
		}
	}
	
});

