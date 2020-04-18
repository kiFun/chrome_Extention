var $=document;
var isSearching;

const msg=function(a,c=function(){}){
	chrome.runtime.sendMessage({type:"winState",b:a},c);
}

const CE=function(t, c,i, inner){
	let a=$.createElement(t);
	a.className=c;
	a.id=i;
	a.innerHTML=inner;
	return a;
}
const init=function(){//factory method
	let factMeth;
	w.innerHTML="";
	if(isSearching) factMeth=concFact3;
	else factMeth=concFact1;
	factMeth();
}

const concFact1=function(){
	let bAddColumn=CE("button", "colButtonAdd","bAddColumn","�������� �������");
	bAddColumn.onclick=function(){
		if(bAddColumn.innerHTML=="�������� �������"){
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"addCol",other:true}},function(resp){});
			bAddColumn.innerHTML="������";
		}else{
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"addCol",other:false}},function(resp){});
			bAddColumn.innerHTML="�������� �������";
		}
	}
	w.append(bAddColumn);

	let bShowColumn=CE("button", "colButtonShow", "bShowColumn", "�������� �������");
	bShowColumn.onclick=function(){
		if(bShowColumn.innerHTML=="�������� �������"){
			bShowColumn.innerHTML="������ �������";
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"showCols"}},(r)=>{});
		}else{
			bShowColumn.innerHTML="�������� �������";
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"hideCols"}},(r)=>{});
		}
	}
	w.append(bShowColumn);
	
	let bSearch=CE("button","searchParser","bSearch","�����");
	bSearch.onclick=function(){
		msg({el:"search",state:true});
		isSearching=true;
		init();
	}
	w.append(bSearch);
	let configDiv=CE("div", "divConfigDiv", "configDiv", "");
	w.append(configDiv);
	msg({el:"switch",state:"np"});
	let bAddNextPage=CE("button", "bCDMember", "bAddNextPage", "������� ������ �� ��������� ��������");
	let bShowNextPage=CE("button", "bCDMember", "bShowNextPage", "�������� ������ �� ��������� ��������");
	bAddNextPage.onclick=function(){
		if(bAddNextPage.innerHTML=="������� ������ �� ��������� ��������"){
			bAddNextPage.innerHTML="������";
			chrome.runtime.sendMessage({type:"cmd", b:{cType:"addNextPage"}}, (resp)=>{});
		}else{
			bAddNextPage.innerHTML="������� ������ �� ��������� ��������";
			chrome.runtime.sendMessage({type:"cmd", b:{cType:"cAddNextPage"}}, (resp)=>{});
		}
	}
	bShowNextPage.onclick=function(){
		if(bShowNextPage.innerHTML=="�������� ������ �� ��������� ��������"){
			bShowNextPage.innerHTML="������";
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"showNextPage"}},(r)=>{});
		}else{
			bShowNextPage.innerHTML="�������� ������ �� ��������� ��������";
			chrome.runtime.sendMessage({type:"cmd",b:{cType:"hideNextPage"}},(r)=>{});
		}
	}
	configDiv.innerHTML="";
	configDiv.append(bAddNextPage);
	configDiv.append(bShowNextPage);
}

const concFact3=function(){
	w.innerHTML="";
	let abortSearch=CE("button", "searchParser", "abortSearch", "�������� �����");
	abortSearch.onclick=function(){
		msg({el:"search",state:false});
		isSearching=false;
		init();
	};
	w.append(abortSearch);
}

chrome.runtime.sendMessage({type:"get",b:"winInit"},function(resp){
	ls=resp.SP;
	chrome.runtime.onMessage.addListener((req,s,resp)=>{
		if(req.type=="download"){
			let a=$.createElement("a");
			a.href="data:application/txt;charset=utf-8," + encodeURIComponent(JSON.stringify({results:req.b}));
			a.download="results.json";
			w.append(a);
			let e = document.createEvent('MouseEvents');
        		e.initEvent('click' ,true ,true);
        		a.dispatchEvent(e);
			a.remove();
		}
	});
	init();
});
