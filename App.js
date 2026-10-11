import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IDS = {
  banner: "ca-app-pub-9890149028563226/7565306387",
  inter: "ca-app-pub-9890149028563226/5859110495",
  appopen: "ca-app-pub-9890149028563226/1285440667",
  native: "ca-app-pub-9890149028563226/9108090368"
};
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",cai:"偏財",c:"#4FC3F7"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",cai:"帝旺",c:"#4FC3F7"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",cai:"橫財",c:"#4FC3F7"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",cai:"金庫",c:"#D7CCC8"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",cai:"地產",c:"#D7CCC8"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",cai:"創業",c:"#81C784"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",cai:"正財",c:"#81C784"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",cai:"旺財",c:"#81C784"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",cai:"小財",c:"#81C784"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",cai:"財庫",c:"#D7CCC8"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",cai:"文昌財",c:"#81C784"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",cai:"快財",c:"#FF8A65"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",cai:"名氣財",c:"#FF8A65"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",cai:"旺財",c:"#FF8A65"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",cai:"暗財",c:"#FF8A65"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",cai:"田宅",c:"#D7CCC8"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",cai:"財庫位",c:"#D7CCC8"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",cai:"貴人財",c:"#FFD54F"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",cai:"武財",c:"#FFD54F"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",cai:"兌現",c:"#FFD54F"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",cai:"珠寶財",c:"#FFD54F"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",cai:"大庫",c:"#D7CCC8"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",cai:"天財",c:"#FFD54F"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",cai:"長線財",c:"#4FC3F7"},
];
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"2026一白入正北，最大偏財", lay:"正北放一杯清水+6硬幣，養黑魚，錢包向北，忌紅色。"},
  "東北": {star:"八白", name:"正財帝位", cai:99, color:"#FFD700", good:true, desc:"2026八白最旺，正財帝王位", lay:"東北放黃水晶聚寶盆+五帝錢，保險箱放此位，最旺。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"三碧是非，易有合約破財", lay:"放紅地氈+紅燈，用紅文件夾，忌魚缸。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"文昌利考試寫作流量", lay:"四枝富貴竹+文昌塔放東南，直播寫嘢向東南。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"九紫喜慶，人緣財", lay:"9枝紅花+紅燈放正南，喜慶直播帶貨。"},
  "西南": {star:"二黑", name:"病符位", cai:15, color:"#888", good:false, desc:"二黑病符注意健康破財", lay:"銅葫蘆+五帝錢，保持整潔。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤易被盜騙", lay:"一杯清水+藍地氈，錢包唔放西。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"六白貴人帶財", lay:"金屬風鈴+六帝錢放西北，向西北坐談生意。"},
};

function calcBazi(s){
  try{
    var d=new Date(s); if(isNaN(d.getTime())) return null;
    var st=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var y=d.getFullYear(); var m=d.getMonth()+1; var day=d.getDate();
    var ys=st[(y-4)%10]; var ds=st[(day*2+m)%10];
    var mp={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    var five={木:1,火:1,土:1,金:1,水:1}; five[mp[ys]]++; five[mp[ds]]++;
    var weak=Object.entries(five).sort(function(a,b){return a[1]-b[1];})[0][0];
    var lk={木:{dir:"正南",col:"紅紫色",el:"火"},火:{dir:"西南",col:"黃色",el:"土"},土:{dir:"正西",col:"白金色",el:"金"},金:{dir:"正北",col:"黑藍色",el:"水"},水:{dir:"正東",col:"綠色",el:"木"}};
    return {full:y+"年 "+ys+"命 日主"+ds, five:five, xi:weak, dir:lk[weak].dir, col:lk[weak].col, el:lk[weak].el};
  }catch(e){ return null; }
}
function getDailyFortune(){
  var now=new Date(); var day=now.getDate();
  var yday=Math.floor((now - new Date(now.getFullYear(),0,0))/1000/60/60/24);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"];
  var caiDir=dirs[(day*3+yday*2)%8]; var xiDir=dirs[(day*5+3)%8];
  var colors=["黑藍","黃金","綠色","紅紫","白金"]; var col=colors[day%5];
  var hours=["子23-1","丑1-3","寅3-5","卯5-7","辰7-9","巳9-11","午11-13","未13-15","申15-17","酉17-19","戌19-21","亥21-23"];
  var goodH=hours[(day)%12]+"、"+hours[(day+4)%12]+" 吉"; var badH=hours[(day+6)%12]+" 忌";
  return {date:(now.getMonth()+1)+"月"+now.getDate()+"日", caiDir:caiDir, xiDir:xiDir, col:col, goodH:goodH, badH:badH, tip:["今日宜向"+caiDir+"坐，談錢最旺","喜神在"+xiDir+"，著"+col+"色衫，帶6枚硬幣","吉時 "+goodH+" 開單最好","忌 "+badH+" 簽大合約"]};
}

export default function App(){
  var _useState=useState('today'); var tab=_useState[0]; var setTab=_useState[1];
  var _useState2=useState(0); var heading=_useState2[0]; var setHeading=_useState2[1];
  var _useState3=useState(0); var smooth=_useState3[0]; var setSmooth=_useState3[1];
  var _useState4=useState('啟動中...'); var debug=_useState4[0]; var setDebug=_useState4[1];
  var _useState5=useState(false); var adsReady=_useState5[0]; var setAdsReady=_useState5[1];
  var _useState6=useState(false); var interReady=_useState6[0]; var setInterReady=_useState6[1];
  var _useState7=useState(''); var baziInput=_useState7[0]; var setBaziInput=_useState7[1];
  var _useState8=useState(null); var baziRes=_useState8[0]; var setBaziRes=_useState8[1];
  var _useState9=useState(false); var unlocked=_useState9[0]; var setUnlocked=_useState9[1];
  var _useState10=useState(0); var lastInter=_useState10[0]; var setLastInter=_useState10[1];
  var interRef=useRef(null); var lastRaw=useRef(0); var magF=useRef({x:0,y:0});
  var daily=useMemo(function(){return getDailyFortune();},[]);

  useEffect(function(){
    var sub;
    try{
      Magnetometer.setUpdateInterval(100);
      sub=Magnetometer.addListener(function(d){
        if(magF.current.x===0){ magF.current={x:d.x,y:d.y}; }else{ magF.current.x=magF.current.x*0.6+d.x*0.4; magF.current.y=magF.current.y*0.6+d.y*0.4; }
        var x=magF.current.x; var y=magF.current.y; setDebug("磁場 "+x.toFixed(0)+","+y.toFixed(0));
        var a=Math.atan2(y,x)*180/3.14159; a=(a+360)%360; a=(360-a)%360;
        var diff=a-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
        lastRaw.current=(lastRaw.current+diff*0.45+360)%360; setHeading(lastRaw.current);
      });
      AsyncStorage.getItem('bazi_v1').then(function(v){ if(v){ setBaziInput(v); setBaziRes(calcBazi(v)); } });
    }catch(err){ setDebug("錯誤:"+String(err)); }
    return function(){ try{ if(sub){ sub.remove(); } }catch(err2){} };
  },[]);
  useEffect(function(){ var t=setInterval(function(){ var d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.2) setSmooth(function(v){return (v+d*0.3+360)%360;}); },33); return function(){ clearInterval(t); }; },[heading,smooth]);
  useEffect(function(){ setTimeout(function(){ try{ mobileAds().initialize().then(function(){ setAdsReady(true); var inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true}); interRef.current=inter; inter.load(); inter.addAdEventListener(AdEventType.LOADED,function(){setInterReady(true);}); inter.addAdEventListener(AdEventType.CLOSED,function(){ setLastInter(Date.now()); inter.load(); }); AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load(); }).catch(function(e){}); }catch(err){} },800); },[]);

  var curM=useMemo(function(){ var i=Math.floor((smooth+7.5)/15)%24; return MOUNTAINS_INFO[i]||MOUNTAINS_INFO[0]; },[smooth]);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; var curDir=dirs[Math.round(smooth/45)%8]; var fly=FLY_2026[curDir]||FLY_2026["正北"];
  var showInter=function(cb){ Alert.alert("提示","查看詳細佈局將播放廣告，可跳過",[{text:"取消",style:"cancel"},{text:"繼續",onPress:function(){ var now=Date.now(); if(interReady&&now-lastInter>25000&&interRef.current){ var u=interRef.current.addAdEventListener(AdEventType.CLOSED,function(){cb();u();}); interRef.current.show().catch(function(){cb();}); } else cb(); }}]); };

  if(tab==='today'){
    var isMatch = baziRes && baziRes.dir===daily.caiDir;
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>今日財運 {daily.date}</Text><Text style={s.sub}>每日一變 • 今日必看 {debug}</Text>
          <View style={[s.heroCard,{borderColor: isMatch?'#FFD700':'#D4AF37'}]}>
            <Text style={s.heroTitle}>今日財神 {daily.caiDir} {isMatch?'★超級財日★':''}</Text>
            <Text style={s.heroSub}>喜神 {daily.xiDir} • 幸運色 {daily.col} • {daily.goodH}</Text>
            <View style={{marginTop:12}}>
              {daily.tip.map(function(t,i){return (<Text key={i} style={s.tip}>• {t}</Text>);})}
            </View>
            {baziRes && <View style={[s.matchBox,{backgroundColor: isMatch?'#FFD70022':'#222'}]}><Text style={[s.matchText,{color: isMatch?'#FFD700':'#888'}]}>{isMatch?"你喜"+baziRes.xi+"("+baziRes.dir+")，今日財神正好在"+daily.caiDir+"，今日係你超級催財日！宜簽單、收款、開張！":"你喜"+baziRes.xi+"宜"+baziRes.dir+"，今日財神在"+daily.caiDir+"，可配合。"}</Text></View>}
            <TouchableOpacity style={s.goldBtn} onPress={function(){showInter(function(){Alert.alert('今日催財3步',"1. 今早 "+daily.goodH+" 面向"+daily.caiDir+"坐\n2. 著"+daily.col+"色衫，放6枚硬幣在"+daily.caiDir+"\n3. "+daily.badH+" 唔好借錢簽約");});}}><Text style={s.goldBtnText}>查看今日催財3步</Text></TouchableOpacity>
          </View>
          <View style={s.row}><View style={[s.miniCard,{borderColor:FLY_2026[daily.caiDir].color}]}><Text style={s.miniT}>年財位</Text><Text style={[s.miniV,{color:FLY_2026[daily.caiDir].color}]}>{FLY_2026[daily.caiDir].name}</Text><Text style={s.miniD}>{daily.caiDir}</Text></View><View style={[s.miniCard,{borderColor:FLY_2026[daily.xiDir].color}]}><Text style={s.miniT}>喜神</Text><Text style={[s.miniV,{color:FLY_2026[daily.xiDir].color}]}>{daily.xiDir}</Text><Text style={s.miniD}>{FLY_2026[daily.xiDir].star}</Text></View><View style={s.miniCard}><Text style={s.miniT}>吉時</Text><Text style={s.miniV}>{daily.goodH.split('、')[0]}</Text><Text style={s.miniD}>開運</Text></View></View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>今日</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>總覽</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='finance'){
    var list=Object.entries(FLY_2026).sort(function(a,b){return b[1].cai-a[1].cai;});
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>2026財位總覽</Text><Text style={s.sub}>全年唔變 • 用嚟擺屋企 • 今日財神 {daily.caiDir}</Text>
          {list.map(function(pair){ var k=pair[0]; var v=pair[1]; return (<View key={k} style={[s.fCard,{borderLeftColor:v.color}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={[s.fTitle,{color:v.color}]}>{k} {v.name} {v.cai}%</Text><Text style={{color:v.good?'#4CAF50':'#FF5252',fontSize:12}}>{v.good?'旺':'避'} {k===daily.caiDir?'•今日財神':''}</Text></View><Text style={s.fDesc}>{v.desc}</Text><Text style={s.fLay}>→ {v.lay}</Text></View>); })}
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('today');}}><Text style={s.tabOff}>今日</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>總覽</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='bazi'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>八字財庫</Text><Text style={s.sub}>喜用神 + 今日配對 • {debug}</Text>
          <View style={[s.card,{width:'100%'}]}><TextInput style={s.input} placeholder="YYYY-MM-DD 生日" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} /><TouchableOpacity style={s.goldBtn} onPress={function(){ var r=calcBazi(baziInput); if(!r){ setBaziRes({error:"格式 YYYY-MM-DD"}); } else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); }}}><Text style={s.goldBtnText}>分析我的財位</Text></TouchableOpacity>{baziRes &&!baziRes.error && <View style={s.unlockedBox}><Text style={s.unlockedText}>{baziRes.full}{'\n'}五行 木{baziRes.five.木} 火{baziRes.five.火} 土{baziRes.five.土} 金{baziRes.five.金} 水{baziRes.five.水}{'\n'}喜 {baziRes.xi} 宜 {baziRes.dir} {baziRes.col} 行 {baziRes.el}{'\n'}今日財神 {daily.caiDir} {baziRes.dir===daily.caiDir?'★今日超旺你★':'可借力'}</Text></View>}{baziRes && baziRes.error && <Text style={s.unlockedText}>{baziRes.error}</Text>}</View>
          <View style={s.nativeBox}>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('today');}}><Text style={s.tabOff}>今日</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>總覽</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:30}}>
        <Text style={s.title}>風水佬Go {Math.round(smooth)}°</Text><Text style={s.sub}>{debug} • {curDir} {fly.star} • {curM.m}山 {daily.caiDir}財神</Text>
        <View style={s.luoWrap}>
          <View style={s.northArrow}><Text style={s.northArrowT}>▼ 北</Text></View>
          <View style={[s.luoOuter, {transform:[{rotate:""+(-smooth)+"deg"}]}]}>
            <View style={s.luoMid}>
              {MOUNTAINS_24.map(function(m,i){ var isActive = curM.m===m; return (<View key={m} style={[s.mMark, {transform:[{rotate:""+(i*15)+"deg"}, {translateY:-115}]}]}><View style={[s.mBubble, isActive && s.mBubbleActive, {backgroundColor: isActive? '#D4AF37' : MOUNTAINS_INFO[i].c+'22'}]}><Text style={[s.mText, isActive && s.mTextActive, {color: isActive?'#000':MOUNTAINS_INFO[i].c}]}>{m}</Text></View></View>); })}
              <View style={s.centerRing}><View style={s.centerDot}><Text style={s.centerText}>{curM.m}</Text><Text style={s.centerSub}>{curM.gua}</Text></View></View>
            </View>
            <Text style={s.degreeMark}>0°</Text>
          </View>
        </View>
        <View style={[s.card, {borderColor: fly.color, borderWidth:1.2}]}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={[s.cardTitle, {color:fly.color}]}>{curDir} {fly.star}{fly.name}</Text><Text style={[s.cardTitle,{color:fly.color}]}>財力{fly.cai}%</Text></View><Text style={s.cardDesc}>{fly.desc} • 坐{curM.m}山 {curM.deg}° {curM.wu}行 {curM.cai} • 今日財神{daily.caiDir}</Text>{!unlocked? (<TouchableOpacity style={s.goldBtn} onPress={function(){showInter(function(){setUnlocked(true);});}}><Text style={s.goldBtnText}>查看詳細佈局</Text></TouchableOpacity>) : (<View style={s.unlockedBox}><Text style={s.unlockedText}>{fly.lay}{'\n'}今日：面向{daily.caiDir}，吉時{daily.goodH}</Text><View style={{flexDirection:'row', marginTop:10}}><TouchableOpacity style={s.smallBtn} onPress={function(){Share.share({message:"風水佬Go 今日財神"+daily.caiDir+" "+curDir+fly.name+" "+fly.lay});}}><Text style={s.smallBtnT}>分享今日財位</Text></TouchableOpacity><TouchableOpacity style={[s.smallBtn,{marginLeft:8}]} onPress={function(){setUnlocked(false);}}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity></View></View>)}</View>
        <View style={s.nativeBox}><Text style={s.adLabel}>推薦內容</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('today');}}><Text style={s.tabOff}>今日</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>總覽</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity></View>
      <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#080808', alignItems:'center'},
  title:{color:'#D4AF37', fontSize:22, fontWeight:'bold'}, sub:{color:'#888', fontSize:11, marginTop:4},
  heroCard:{width:'100%', backgroundColor:'#151515', borderRadius:16, padding:16, marginTop:12, borderWidth:1.5, borderColor:'#D4AF37'},
  heroTitle:{color:'#FFD700', fontSize:18, fontWeight:'bold'}, heroSub:{color:'#aaa', fontSize:12, marginTop:6}, tip:{color:'#ddd', fontSize:13, marginTop:6, lineHeight:20},
  matchBox:{marginTop:12, padding:10, borderRadius:10}, matchText:{fontSize:12, lineHeight:18},
  row:{flexDirection:'row', width:'100%', marginTop:12}, miniCard:{flex:1, backgroundColor:'#151515', borderRadius:12, padding:10, marginLeft:6, borderWidth:1, borderColor:'#333', alignItems:'center'}, miniT:{color:'#888', fontSize:11}, miniV:{fontSize:16, fontWeight:'bold', marginTop:4}, miniD:{color:'#666', fontSize:10, marginTop:2},
  luoWrap:{width:320,height:320, alignItems:'center', justifyContent:'center', marginTop:10},
  northArrow:{position:'absolute', top:-6, zIndex:10}, northArrowT:{color:'#FF3B30', fontSize:14, fontWeight:'bold'},
  luoOuter:{width:300,height:300, borderRadius:150, borderWidth:2, borderColor:'#D4AF37', backgroundColor:'#141414', alignItems:'center', justifyContent:'center'},
  luoMid:{width:240,height:240, borderRadius:120, borderWidth:1, borderColor:'#2a2a2a', backgroundColor:'#0f0f0f', alignItems:'center', justifyContent:'center'},
  mMark:{position:'absolute', top:'50%', left:'50%', width:28, marginLeft:-14, marginTop:-14, alignItems:'center'},
  mBubble:{width:24,height:24, borderRadius:12, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#222'}, mBubbleActive:{borderColor:'#D4AF37', width:28,height:28, borderRadius:14},
  mText:{fontSize:11, fontWeight:'600'}, mTextActive:{fontSize:13, fontWeight:'bold'},
  centerRing:{width:90,height:90, borderRadius:45, borderWidth:2, borderColor:'#D4AF37', backgroundColor:'#1a1a1a', alignItems:'center', justifyContent:'center'},
  centerDot:{width:64,height:64, borderRadius:32, backgroundColor:'#D4AF37', alignItems:'center', justifyContent:'center'}, centerText:{color:'#000',fontWeight:'bold',fontSize:18}, centerSub:{color:'#000',fontSize:10},
  degreeMark:{position:'absolute', top:8, color:'#D4AF37', fontSize:10, fontWeight:'bold'},
  card:{width:'92%', backgroundColor:'#1c1c1e', borderRadi
