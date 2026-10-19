import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, StatusBar, Platform, Linking, AppState } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, RewardedAd, NativeAd, RewardedAdEventType, AdEventType, NativeAdEventType, AppOpenAd, NativeAdView, NativeAsset, NativeAssetType, NativeMediaView } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
const APP_VERSION = "v1.0";
const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const REWARD_ID = "ca-app-pub-9890149028563226/6307389980";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const CONTACT_EMAIL = "fungfung1984@gmail.com";
const PRIVACY_URL = "https://laptime-go.github.io/FungSui-Go/privacy.html";
function mod(n,m){ return ((n % m) + m) % m; }
const STEM_WU = {甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
const BRANCH_WU = {子:"水",丑:"土",寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水"};
const HIDDEN_STEMS = {
  子:[{s:"癸",w:100}],
 丑:[{s:"己",w:60},{s:"癸",w:30},{s:"辛",w:10}],
 寅:[{s:"甲",w:60},{s:"丙",w:30},{s:"戊",w:10}],
 卯:[{s:"乙",w:100}],
 辰:[{s:"戊",w:60},{s:"乙",w:30},{s:"癸",w:10}],
 巳:[{s:"丙",w:60},{s:"庚",w:30},{s:"戊",w:10}],
 午:[{s:"丁",w:70},{s:"己",w:30}],
  未:[{s:"己",w:60},{s:"丁",w:30},{s:"乙",w:10}],
 申:[{s:"庚",w:60},{s:"壬",w:30},{s:"戊",w:10}],
 酉:[{s:"辛",w:100}],
 戌:[{s:"戊",w:60},{s:"辛",w:30},{s:"丁",w:10}],
 亥:[{s:"壬",w:70},{s:"甲",w:30}],
};
const LICHUN_DAY = {2020:4,2021:3,2022:4,2023:4,2024:4,2025:3,2026:4,2027:4,2028:5,2029:4,2030:4};
function getLichunDay(y){ return LICHUN_DAY[y] || 4; }
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",low:337.5,high:352.5,cai:"偏財",col:"#4A90E2"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",low:352.5,high:7.5,cai:"帝旺",col:"#4A90E2"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",low:7.5,high:22.5,cai:"橫財",col:"#4A90E2"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",low:22.5,high:37.5,cai:"金庫",col:"#D4AF37"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",low:37.5,high:52.5,cai:"地產",col:"#D4AF37"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",low:52.5,high:67.5,cai:"創業",col:"#51CF66"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",low:67.5,high:82.5,cai:"正財",col:"#51CF66"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",low:82.5,high:97.5,cai:"旺財",col:"#51CF66"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",low:97.5,high:112.5,cai:"小財",col:"#51CF66"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",low:112.5,high:127.5,cai:"財庫",col:"#D4AF37"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",low:127.5,high:142.5,cai:"文昌財",col:"#51CF66"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",low:142.5,high:157.5,cai:"快財",col:"#FF6B6B"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",low:157.5,high:172.5,cai:"名氣財",col:"#FF6B6B"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",low:172.5,high:187.5,cai:"旺財",col:"#FF6B6B"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",low:187.5,high:202.5,cai:"暗財",col:"#FF6B6B"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",low:202.5,high:217.5,cai:"田宅",col:"#D4AF37"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",low:217.5,high:232.5,cai:"財庫位",col:"#D4AF37"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",low:232.5,high:247.5,cai:"貴人財",col:"#C0C0C0"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",low:247.5,high:262.5,cai:"武財",col:"#C0C0C0"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",low:262.5,high:277.5,cai:"兌現",col:"#C0C0C0"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",low:277.5,high:292.5,cai:"珠寶財",col:"#C0C0C0"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",low:292.5,high:307.5,cai:"大庫",col:"#D4AF37"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",low:307.5,high:322.5,cai:"天財",col:"#C0C0C0"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",low:322.5,high:337.5,cai:"長線財",col:"#4A90E2"},
];
MOUNTAINS_INFO.forEach(function(info){ info.cDeg = getCenterDeg(info); });
function getCenterDeg(info){
  if(info.low > info.high){ return mod((info.low + info.high + 360) / 2, 360); }
  return (info.low + info.high) / 2;
}
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"一白星到正北，利偏財，投資同獎金運。", lay:"正北放一杯清水加6枚硬幣，保持乾淨整潔。"},
  "東北": {star:"八白", name:"正財位", cai:99, color:"#FFD700", good:true, desc:"八白星到東北，2026年最旺正財位。", lay:"東北放黃水晶加5枚銅錢，可放聚寶盆。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"三碧星到正東，易有是非口舌，官非爭執。", lay:"正東放紅色地氈，少放尖銳物品。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"四綠星到東南，利學業，考試同文職升遷。", lay:"東南放4枝富貴竹，水要保持清潔。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"九紫星到正南，利喜事，姻緣同名氣。", lay:"正南放9枝紅花，或紅色裝飾品。"},
  "西南": {star:"二黑", name:"病位", cai:15, color:"#888", good:false, desc:"二黑星到西南，主病痛，老人家要特別注意。", lay:"西南放銅葫蘆，床頭避免擺放喺此方位。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤星到正西，易破財，口舌同盜竊。", lay:"正西放一杯清水加藍色地氈，唔好動土。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"六白星到西北，利貴人，事業同出外運。", lay:"西北放金屬風鈴，或圓形金屬擺件。"},
};
const THEME = {
  dark: { bg:'#0a0a0a', card:'#1c1c1e', card2:'#161616', text:'#fff', sub:'#D4AF37', top:'#111', border:'#333', input:'#222', tabOff:'#eee' },
  light: { bg:'#f5f3e8', card:'#ffffff', card2:'#fff8e1', text:'#222', sub:'#8a6d00', top:'#ffffff', border:'#e0d5b0', input:'#f0e6c8', tabOff:'#555' }
};function calcBazi(dateStr, hourIdx){
  try{
    var parts = (dateStr||"").split("-");
    if(parts.length!==3) return null;
    var y=parseInt(parts[0],10), m=parseInt(parts[1],10), day=parseInt(parts[2],10);
    if(!y||!m||!day||m<1||m>12||day<1||day>31) return null;
    var d=new Date(Date.UTC(y,m-1,day));
    if(isNaN(d.getTime()) || d.getUTCDate()!==day || d.getUTCMonth()+1!==m) return null;
    var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var branches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var lichun = (typeof getLichunDay==="function") ? getLichunDay(y) : 4;
    var yearForStem = (m<2 || (m===2 && day<lichun)) ? y-1 : y;
    var yStemIdx = mod(yearForStem-4,10);
    var yBranchIdx = mod(yearForStem-4,12);
    var yearStem=stems[yStemIdx];
    var yBranch=branches[yBranchIdx];
    var jieIdx;
    if(m===1){ jieIdx = day<5?11:0; }
    else if(m===2){ jieIdx = day<lichun?0:1; }
    else if(m===3){ jieIdx = day<5?1:2; }
    else if(m===4){ jieIdx = day<5?2:3; }
    else if(m===5){ jieIdx = day<5?3:4; }
    else if(m===6){ jieIdx = day<5?4:5; }
    else if(m===7){ jieIdx = day<7?5:6; }
    else if(m===8){ jieIdx = day<7?6:7; }
    else if(m===9){ jieIdx = day<7?7:8; }
    else if(m===10){ jieIdx = day<8?8:9; }
    else if(m===11){ jieIdx = day<7?8:9; }
    else { jieIdx = day<7?9:10; }
    var mBranchIdx = mod(jieIdx+2,12);
    var mBranch=branches[mBranchIdx];
    var mStemIdx = mod(yStemIdx*2+2+jieIdx,10);
    var mStem=stems[mStemIdx];
    var base=Date.UTC(1900,0,31);
    var diff=Math.floor((Date.UTC(y,m-1,day)-base)/86400000);
    var dayStemIdx=mod(diff,10);
    var dayBranchIdx=mod(10+diff,12);
    var dayStem=stems[dayStemIdx];
    var dayBranch=branches[dayBranchIdx];
    var hBranch=""; var hStem="";
    if(hourIdx!=null && hourIdx>=0 && hourIdx<12){
      hBranch=branches[hourIdx];
      var hBase=mod((dayStemIdx%5)*2,10);
      var hStemIdx=mod(hBase+hourIdx,10);
      hStem=stems[hStemIdx];
    }
    var dmEl = STEM_WU[dayStem];
    var stemsPresent=[yearStem,mStem,dayStem];
    if(hStem) stemsPresent.push(hStem);
    var branchesPresent=[yBranch,mBranch,dayBranch];
    if(hBranch) branchesPresent.push(hBranch);
    var support=0; var total=0;
    for(var si=0;si<stemsPresent.length;si++){ total+=1; if(STEM_WU[stemsPresent[si]]===dmEl) support+=1; }
    for(var bi=0;bi<branchesPresent.length;bi++){
      var hs=HIDDEN_STEMS[branchesPresent[bi]]||[];
      for(var hi=0;hi<hs.length;hi++){ total+=hs[hi].w/100; if(STEM_WU[hs[hi].s]===dmEl) support+=hs[hi].w/100; }
    }
    var seasonEl="土";
    if(["寅","卯","辰"].indexOf(mBranch)>=0) seasonEl="木";
    else if(["巳","午","未"].indexOf(mBranch)>=0) seasonEl="火";
    else if(["申","酉","戌"].indexOf(mBranch)>=0) seasonEl="金";
    else if(["亥","子","丑"].indexOf(mBranch)>=0) seasonEl="水";
    if(seasonEl===dmEl){ support+=1; total+=1; }
    if(dmEl==="土" && ["辰","戌","丑","未"].indexOf(mBranch)>=0){ support+=1; total+=1; }
    var ratio = total>0 ? support/total : 0.35;
    var strength = ratio>=0.45 ? "身強" : (ratio<=0.30 ? "身弱" : "中和");
    var gen={木:"火",火:"土",土:"金",金:"水",水:"木"};
    var genMe={木:"水",火:"木",土:"火",金:"土",水:"金"};
    var ctrlMe={木:"金",火:"水",土:"木",金:"火",水:"土"};
    var yong, xiShen;
    if(strength==="身強"){ yong=ctrlMe[dmEl]; xiShen=gen[dmEl]; }
    else if(strength==="身弱"){ yong=genMe[dmEl]; xiShen=dmEl; }
    else { yong=gen[dmEl]; xiShen=ctrlMe[dmEl]; }
    var dirCol={木:{dir:"正東",col:"綠色"},火:{dir:"正南",col:"紅紫色"},土:{dir:"西南",col:"黃色"},金:{dir:"正西",col:"白金色"},水:{dir:"正北",col:"黑藍色"}};
    var dc=dirCol[yong];
    var five={木:0,火:0,土:0,金:0,水:0};
    five[STEM_WU[yearStem]]++; five[BRANCH_WU[yBranch]]++;
    five[STEM_WU[mStem]]++; five[BRANCH_WU[mBranch]]++;
    five[STEM_WU[dayStem]]++; five[BRANCH_WU[dayBranch]]++;
    if(hStem) five[STEM_WU[hStem]]++;
    if(hBranch) five[BRANCH_WU[hBranch]]++;
    var hourTxt = hBranch? " "+hStem+hBranch+"時" : " 未定時 三柱";
    var full=y+"年"+yearStem+yBranch+" "+m+"月"+mStem+mBranch+" "+day+"日"+dayStem+dayBranch+hourTxt+" 日主"+dayStem+" "+strength;
    return {full:full, five:five, xi:yong, el:xiShen, dir:dc.dir, col:dc.col, dayStem:dayStem, dayBranch:dayBranch, monthBranch:mBranch, yearStem:yearStem, yearBranch:yBranch, monthStem:mStem, hourStem:hStem, hourBranch:hBranch, strength:strength, yongShen:yong, xiShenShen:xiShen};
  }catch(err){ return null; }
}
function getDayStemBranchUTC(y,m,day){
  var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  var branches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  var base=Date.UTC(1900,0,31);
  var diff=Math.floor((Date.UTC(y,m-1,day)-base)/86400000);
  return {s:stems[mod(diff,10)], b:branches[mod(10+diff,12)]};
}
function get7DayDetail(res){
  var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  var chongPairs=["子午","丑未","寅申","卯酉","辰戌","巳亥"];
  var hePairs=["子丑","寅亥","卯戌","辰酉","巳申","午未"];
  function isPair(a,b,list){ var k1=a+b, k2=b+a; for(var i=0;i<list.length;i++){ if(list[i]===k1||list[i]===k2) return true; } return false; }
  var out=[];
  var now=new Date();
  for(var i=0;i<7;i++){
    var d=new Date(now.getTime()+i*86400000);
    var yy=d.getUTCFullYear(), mm=d.getUTCMonth()+1, dd=d.getUTCDate();
    var pb=getDayStemBranchUTC(yy,mm,dd);
    var dStem=pb.s; var dBranch=pb.b;
    var dEl=STEM_WU[dStem]; var dBEl=BRANCH_WU[dBranch];
    var score=70;
    var notes=[];
    if(dEl===res.xi || dEl===res.el){ score+=12; notes.push("得用神"); }
    if(dBEl===res.xi || dBEl===res.el){ score+=8; notes.push("地支幫扶"); }
    if(dStem===res.dayStem){ score+=5; }
    if(dBranch===res.dayBranch){ score+=5; notes.push("伏吟守成"); }
    if(isPair(dBranch,res.dayBranch,chongPairs)){ score-=20; notes.push("日支相沖"); }
    if(res.monthBranch && isPair(dBranch,res.monthBranch,chongPairs)){ score-=15; notes.push("月令受沖"); }
    if(isPair(dBranch,res.dayBranch,hePairs)){ score+=10; notes.push("六合"); }
    if(score>99) score=99; if(score<5) score=5;
    var note = notes.length>0 ? notes.join("，") : (score>=75 ? "大利"+res.el+"，宜"+res.col : "宜守為上，忌衝"+res.xi);
    out.push((i===0?"今日":i+"日後")+" "+mm+"月"+dd+"日 "+dStem+dBranch+" "+res.dir+" "+score+"分："+note);
  }
  return out.join("\n");
}
function getDaily(){
  var now=new Date(); var day=now.getDate();
  var yday=Math.floor((now - new Date(now.getFullYear(),0,0))/1000/60/60/24);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"];
  return {date:(now.getMonth()+1)+"月"+day+"日", caiDir:dirs[mod(day*3+yday*2,8)], xiDir:dirs[mod(day*5+3,8)], col:["黑藍色","黃色","綠色","紅紫色","白金色"][mod(day,5)]};
}
function getMountainByDeg(deg){
  deg=mod(deg,360);
  for(var i=0;i<MOUNTAINS_INFO.length;i++){
    var info=MOUNTAINS_INFO[i];
    if(info.low>info.high){ if(deg>=info.low || deg<info.high) return info; }
    else { if(deg>=info.low && deg<info.high) return info; }
  }
  return MOUNTAINS_INFO[1];
}
function NativeBox({ready,isDark}){
  const [nativeAd,setNativeAd] = useState(null);
  const [noFill,setNoFill] = useState(false);
  const th = isDark? THEME.dark : THEME.light;
  useEffect(()=>{
    if(!ready) return;
    let curAd = null;
    (async ()=>{
      try{
        curAd = await NativeAd.createForAdRequest(NATIVE_ID);
        curAd.addAdEventListener(NativeAdEventType.LOADED, (a)=>{ setNativeAd(a.nativeAd || a); setNoFill(false); });
        curAd.addAdEventListener(NativeAdEventType.ERROR, ()=>{ setNoFill(true); });
        await curAd.load();
      }catch(e){ setNoFill(true); }
    })();
    return ()=>{ try{ if(curAd && curAd.destroy) curAd.destroy(); }catch(e){} };
  },[ready]);
  if(noFill){
    return (
      <View style={[s.nativeBox,{backgroundColor:th.card2,borderColor:th.border, minHeight:260, alignItems:'center', justifyContent:'center'}]}>
        <Text style={{color:th.tabOff, fontSize:11, marginBottom:6}}>推薦</Text>
        <BannerAd unitId={BANNER_ID} size={BannerAdSize.MEDIUM_RECTANGLE} />
      </View>
    );
  }
  if(!nativeAd) return null;
  return (
    <View style={[s.nativeBox,{backgroundColor:th.card2,borderColor:th.border}]}>
      <NativeAdView nativeAd={nativeAd} style={{width:'100%'}}>
        <View style={{flexDirection:'row', width:'100%', alignItems:'center'}}>
          <NativeAsset assetType={NativeAssetType.ICON}><View style={{width:40,height:40,borderRadius:8,overflow:'hidden',backgroundColor:'#222'}}><NativeMediaView style={{width:40,height:40}} /></View></NativeAsset>
          <View style={{marginLeft:10, flex:1}}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}><Text style={{color:isDark?'#FFD700':'#8a6d00',fontWeight:'bold',fontSize:15}}>{nativeAd.headline}</Text></NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}><Text style={{color:th.tabOff,fontSize:11,marginTop:2}}>{nativeAd.advertiser}</Text></NativeAsset>
          </View>
        </View>
        <NativeAsset assetType={NativeAssetType.BODY}><Text style={{color:th.tabOff,fontSize:13,marginTop:8,lineHeight:18}}>{nativeAd.body}</Text></NativeAsset>
        <NativeMediaView style={{width:'100%',height:170,marginTop:10,backgroundColor:'#000',borderRadius:10}} />
        <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%',marginTop:12,alignItems:'center'}}>
          <NativeAsset assetType={NativeAssetType.STAR_RATING}><Text style={{color:'#D4AF37',fontSize:12}}>★ {nativeAd.starRating||5}</Text></NativeAsset>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}><View style={{backgroundColor:'#D4AF37',paddingHorizontal:18,paddingVertical:8,borderRadius:8}}><Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{nativeAd.callToAction||'查看'}</Text></View></NativeAsset>
        </View>
      </NativeAdView>
    </View>
  );
}
function TopBanner({ready}){
  return (<View style={s.topAdSmall}>{ready && <BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />}</View>);
}export default function App(){
  var _s1=useState('compass'); var tab=_s1[0]; var setTab=_s1[1];
  var _s2=useState(0); var heading=_s2[0]; var setHeading=_s2[1];
  var _s3=useState(0); var smooth=_s3[0]; var setSmooth=_s3[1];
  var _s5=useState(false); var adsReady=_s5[0]; var setAdsReady=_s5[1];
  var _s6=useState(false); var interReady=_s6[0]; var setInterReady=_s6[1];
  var _s7=useState(''); var baziInput=_s7[0]; var setBaziInput=_s7[1];
  var _s7b=useState(null); var baziHour=_s7b[0]; var setBaziHour=_s7b[1];
  var _s8=useState(null); var baziRes=_s8[0]; var setBaziRes=_s8[1];
  var _s9=useState(false); var unlockedCai=_s9[0]; var setUnlockedCai=_s9[1];
  var _s10=useState(0); var lastInter=_s10[0]; var setLastInter=_s10[1];
  var _s11=useState(false); var rewardReady=_s11[0]; var setRewardReady=_s11[1];
  var _s12=useState(true); var isDark=_s12[0]; var setIsDark=_s12[1];
  var _s13=useState(0); var lastBazi=_s13[0]; var setLastBazi=_s13[1];
  var _s14=useState(0); var tick=_s14[0]; var setTick=_s14[1];
  var interRef=useRef(null); var rewardRef=useRef(null); var appOpenRef=useRef(null); var lastRaw=useRef(0); var magF=useRef({x:0,y:0,z:0});
  var smoothRef=useRef(0);
  var appOpenLoaded=useRef(false);
  var appStart=useRef(Date.now());
  var lastAppOpenShown=useRef(0);
  var daily=useMemo(function(){return getDaily();},[]);
  var th = isDark? THEME.dark : THEME.light;
  var statusH = Platform.OS==='android'? ((StatusBar.currentHeight||24)+6) : 44;
  useEffect(function(){
    var mSub=null;
    (async function(){
      try{
        try{ await Magnetometer.setUpdateIntervalAsync(100); }catch(e){}
        mSub=Magnetometer.addListener(function(d){
          if(!d) return;
          magF.current.x=magF.current.x*0.5+(d.x||0)*0.5;
          magF.current.y=magF.current.y*0.5+(d.y||0)*0.5;
          var x=magF.current.x; var y=magF.current.y;
          var angleRaw=Math.atan2(y,x)*180/Math.PI;
          var angle=mod(angleRaw+270,360);
          var diff=angle-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
          lastRaw.current=mod(lastRaw.current+diff*0.4,360);
          setHeading(lastRaw.current);
        });
        var sv=await AsyncStorage.getItem('bazi_v1'); if(sv){ setBaziInput(sv); }
        var sh=await AsyncStorage.getItem('bazi_hour_v1'); if(sh!==null){ var hv=parseInt(sh,10); if(!isNaN(hv)&&hv>=0&&hv<12) setBaziHour(hv); }
        var tm=await AsyncStorage.getItem('theme_v1'); if(tm){ setIsDark(tm==='dark'); }
        var bt=await AsyncStorage.getItem('bazi_unlock_v1'); if(bt){ setLastBazi(parseInt(bt,10)||0); }
      }catch(err){}
    })();
    return function(){ try{ if(mSub){ mSub.remove(); }}catch(err){} };
  },[]);
  useEffect(function(){ var t=setInterval(function(){ var target=lastRaw.current; var cur=smoothRef.current; var d=target-cur; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.2){ var nv=mod(cur+d*0.3,360); smoothRef.current=nv; setSmooth(nv); } },33); return function(){ clearInterval(t); }; },[]);
  useEffect(function(){ if(tab!=='bazi') return; var t2=setInterval(function(){ setTick(function(v){return v+1;}); },1000); return function(){ clearInterval(t2); }; },[tab]);
  useEffect(function(){
    var appStateSub=null;
    setTimeout(async function(){
      try{
        await mobileAds().initialize(); setAdsReady(true);
        const inter = InterstitialAd.createForAdRequest(INTER_ID);
        interRef.current=inter; inter.load();
        inter.addAdEventListener(AdEventType.LOADED,function(){setInterReady(true);});
        inter.addAdEventListener(AdEventType.CLOSED,function(){ setInterReady(false); try{ inter.load(); }catch(e){} });
        const reward = RewardedAd.createForAdRequest(REWARD_ID);
        rewardRef.current=reward; reward.load();
        reward.addAdEventListener(RewardedAdEventType.LOADED,function(){setRewardReady(true);});
        reward.addAdEventListener(AdEventType.CLOSED,function(){ setRewardReady(false); try{ reward.load(); }catch(e){} });
        const appOpenAd = AppOpenAd.createForAdRequest(OPEN_ID);
        appOpenRef.current=appOpenAd;
        appOpenAd.addAdEventListener(AdEventType.LOADED,function(){ appOpenLoaded.current=true; });
        appOpenAd.addAdEventListener(AdEventType.CLOSED,function(){ appOpenLoaded.current=false; try{ appOpenAd.load(); }catch(e){} });
        appOpenAd.addAdEventListener(AdEventType.ERROR,function(){ appOpenLoaded.current=false; try{ appOpenAd.load(); }catch(e){} });
        appOpenAd.load();
        appStateSub=AppState.addEventListener('change', function(next){
          if(next==='active' && appOpenLoaded.current && appOpenRef.current){
            var now2=Date.now();
            if(now2 - lastAppOpenShown.current > 60000){
              lastAppOpenShown.current = now2;
              try{ appOpenRef.current.show(); }catch(e){}
            }
          }
        });
      }catch(err){}
    },1000);
    return function(){ try{ if(appStateSub && appStateSub.remove) appStateSub.remove(); }catch(e){} };
  },[]);
  function analyzeBazi(){
    if(!baziInput){ setBaziRes(null); return; }
    var r=calcBazi(baziInput,baziHour);
    if(!r){ setBaziRes({error:"格式 YYYY-MM-DD"}); return; }
    setBaziRes(r);
    AsyncStorage.setItem('bazi_v1',baziInput);
    if(baziHour==null){ try{ AsyncStorage.removeItem('bazi_hour_v1'); }catch(e){} } else { AsyncStorage.setItem('bazi_hour_v1', String(baziHour)); }
  }
  var currentMountain=useMemo(function(){ return getMountainByDeg(smooth); },[smooth]);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; var currentDir=dirs[mod(Math.floor((smooth+22.5)/45),8)]; var fly=FLY_2026[currentDir]||FLY_2026["正北"];
  var showReward=function(cb){
    if(!rewardReady || rewardRef.current==null){ Alert.alert("提示","廣告準備中，請稍後再試"); return; }
    try{
      var earned=false;
      var uEarn=rewardRef.current.addAdEventListener(RewardedAdEventType.EARNED_REWARD,function(){ earned=true; });
      var uClose=rewardRef.current.addAdEventListener(AdEventType.CLOSED,function(){
        try{ uEarn(); uClose(); uErr(); }catch(e){}
        try{ rewardRef.current.load(); }catch(e){}
        if(earned){
          var now=Date.now(); setLastInter(now); setLastBazi(now); AsyncStorage.setItem('bazi_unlock_v1', String(now)); cb();
        } else { Alert.alert("提示","需要完整觀看廣告先可以解鎖"); }
      });
      var uErr=rewardRef.current.addAdEventListener(AdEventType.ERROR,function(){ try{ uEarn(); uClose(); uErr(); }catch(e){} Alert.alert("提示","廣告載入失敗，請稍後再試"); });
      rewardRef.current.show().catch(function(){ try{ uEarn(); uClose(); uErr(); }catch(e){} });
    }catch(err){}
  };
  var goTab=function(t){
    if(t!==tab){
      var now=Date.now();
      if(now - appStart.current > 30000 && now-lastInter>180000 && interRef.current && interReady){
        try{
          interRef.current.show();
          setLastInter(now);
          setInterReady(false);
        }catch(e){}
      }
    }
    setTab(t);
  };
  var toggleTheme = async function(){ var nd =!isDark; setIsDark(nd); await AsyncStorage.setItem('theme_v1', nd?'dark':'light'); };if(tab==='finance'){
    var list = Object.entries(FLY_2026).sort(function(a,b){return b[1].cai-a[1].cai;});
    return (
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:130}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>財位總覽</Text><Text style={[s.bigSub,{color:th.sub}]}>{daily.date} 財神 {daily.caiDir} 喜神 {daily.xiDir}</Text>
          {list.map(function(pair){ var k=pair[0]; var v=pair[1]; var isToday=k===daily.caiDir; return (<View key={k} style={[s.fCard,{backgroundColor:th.card2,borderColor:isToday?v.color:th.border}, isToday && s.fCardToday]}><Text style={[s.fT,{color:v.color, fontSize:17}]}>{k} {v.name} {v.star} {isToday?'★':''}</Text><Text style={[s.fD,{color:th.tabOff}]}>{v.desc}</Text><Text style={[s.fL,{color:isDark?'#FFD700':'#8a6d00'}]}>{v.lay}</Text></View>); })}
          <NativeBox ready={adsReady} isDark={isDark} />
        </ScrollView>
        <View style={[s.bottomWrapperSafe,{backgroundColor:th.top,borderColor:th.border}]}><View style={[s.tabBar,{backgroundColor:th.top}]}><TouchableOpacity style={s.tab} onPress={function(){goTab('compass');}}><Text style={[s.tabOff,{color:th.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn,{backgroundColor:isDark?'#1e1e1e':'#fff3c0'}]}><Text style={s.tabOnT}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('bazi');}}><Text style={[s.tabOff,{color:th.tabOff}]}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('settings');}}><Text style={[s.tabOff,{color:th.tabOff}]}>設定</Text></TouchableOpacity></View></View>
      </View>
    );
  }
  if(tab==='settings'){
    var showContact = function(){
      Alert.alert("聯絡我們", CONTACT_EMAIL, [{text:"取消", style:"cancel"}, {text:"寄Email", onPress:function(){ Linking.openURL('mailto:'+CONTACT_EMAIL).catch(function(){}); }}]);
    };
    var showPrivacy = function(){
      Alert.alert("私隱政策", "確定要開啟私隱政策網頁嗎？", [{text:"取消", style:"cancel"}, {text:"確定", onPress:function(){ Linking.openURL(PRIVACY_URL).catch(function(){}); }}]);
    };
    return (
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:130}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>設定 {(typeof APP_VERSION!=="undefined"?APP_VERSION:"v1.0")} {isDark?'🌙':'☀️'}</Text><Text style={[s.bigSub,{color:th.sub}]}>{Math.round(smooth)}°</Text>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>外觀模式</Text><Text style={[s.setD,{color:th.tabOff}]}>{isDark?'暗色模式':'日間模式'}</Text><TouchableOpacity style={s.goldBtn} onPress={toggleTheme}><Text style={s.goldBtnText}>{isDark?'切換到 日間☀️':'切換到 暗夜🌙'}</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>羅盤 {Math.round(smooth)}°</Text><Text style={[s.setD,{color:th.tabOff}]}>{currentMountain.m}山 {currentMountain.gua} {currentMountain.wu} {currentMountain.deg}°</Text><TouchableOpacity style={s.goldBtn} onPress={function(){Alert.alert('校準','請遠離磁性物品，將手機平放並畫8字以校準');}}><Text style={s.goldBtnText}>校準</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>聯絡我們</Text><Text style={[s.setD,{color:th.tabOff}]}>{CONTACT_EMAIL}</Text><TouchableOpacity style={s.goldBtn} onPress={showContact}><Text style={s.goldBtnText}>聯絡我們</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>網站及私隱</Text><TouchableOpacity style={s.goldBtn} onPress={showPrivacy}><Text style={s.goldBtnText}>私隱政策</Text></TouchableOpacity></View>
          <NativeBox ready={adsReady} isDark={isDark} />
        </ScrollView>
        <View style={[s.bottomWrapperSafe,{backgroundColor:th.top,borderColor:th.border}]}><View style={[s.tabBar,{backgroundColor:th.top}]}><TouchableOpacity style={s.tab} onPress={function(){goTab('compass');}}><Text style={[s.tabOff,{color:th.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('finance');}}><Text style={[s.tabOff,{color:th.tabOff}]}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('bazi');}}><Text style={[s.tabOff,{color:th.tabOff}]}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn,{backgroundColor:isDark?'#1e1e1e':'#fff3c0'}]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View></View>
      </View>
    );
  }
  if(tab==='bazi'){
    var leftMs = 30*60*1000 - (Date.now()-lastBazi);
    var isDetailFree = leftMs > 0;
    if(leftMs<0) leftMs=0;
    var leftMin = Math.floor(leftMs/60000);
    var leftSec = Math.floor((leftMs%60000)/1000);
    var leftStr = leftMin+"分"+(leftSec<10?"0":"")+leftSec+"秒";
    var fiveStr = baziRes && baziRes.five ? ("五行 木"+baziRes.five.木+" 火"+baziRes.five.火+" 土"+baziRes.five.土+" 金"+baziRes.five.金+" 水"+baziRes.five.水) : "";
    return (
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:130}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00',textAlign:'center'}]}>八字</Text><Text style={[s.bigSub,{color:th.sub,textAlign:'center'}]}>今日財神{daily.caiDir} {isDetailFree?'詳細版剩餘'+leftStr:''}</Text>
          <View style={[s.card,{width:'100%',backgroundColor:th.card,borderColor:th.border,marginTop:14}]}>
            <TextInput style={[s.input,{backgroundColor:th.input,color:th.text,borderColor:th.border}]} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} />
            <View style={{flexDirection:'row', flexWrap:'wrap', marginTop:10}}>
              {["未知","子23-1","丑1-3","寅3-5","卯5-7","辰7-9","巳9-11","午11-13","未13-15","申15-17","酉17-19","戌19-21","亥21-23"].map(function(h,idx){
                var isSel = (idx==0 && baziHour==null) || (baziHour==idx-1);
                return (
                  <TouchableOpacity key={h} onPress={function(){ setBaziHour(idx==0?null:idx-1); }} style={{padding:8, paddingHorizontal:10, borderRadius:8, borderWidth:1, borderColor:isSel?'#D4AF37':'#444', backgroundColor:isSel?'#D4AF37':'transparent', margin:4}}>
                    <Text style={{color:isSel?'#000':th.tabOff, fontSize:12, fontWeight:isSel?'bold':'normal'}}>{h}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={s.goldBtn} onPress={analyzeBazi}><Text style={s.goldBtnText}>分析八字</Text></TouchableOpacity>
            {baziRes && !baziRes.error && (
              <View style={[s.unlockedBox,{backgroundColor:isDark?'#252525':'#fff3c0',marginTop:14}]}>
                <Text style={[s.unlockedText,{color:th.text}]}>
                  {baziRes.full+"\n日主"+baziRes.dayStem+" "+(baziRes.strength||"")+" 用神"+baziRes.xi+" 喜神"+baziRes.el+" 宜"+baziRes.dir+" "+baziRes.col}
                  {fiveStr ? "\n"+fiveStr : ""}
                  {isDetailFree ? "\n\n7日詳細運程：\n"+get7DayDetail(baziRes) : "\n\n免費八字已顯示，觀看廣告後可查看7日詳細運程"}
                </Text>
              </View>
            )}
            {baziRes && baziRes.error && (
              <View style={[s.unlockedBox,{backgroundColor:isDark?'#252525':'#fff3c0',marginTop:14}]}>
                <Text style={[s.unlockedText,{color:th.text}]}>{baziRes.error}</Text>
              </View>
            )}
            <TouchableOpacity style={s.goldBtn} onPress={function(){
              if(!baziRes || baziRes.error){ Alert.alert("提示","請先按分析八字"); return; }
              if(isDetailFree){ Alert.alert("提示","詳細版剩餘 "+leftStr); return; }
              showReward(function(){
                var now=Date.now(); setLastBazi(now); setLastInter(now); AsyncStorage.setItem('bazi_unlock_v1', String(now));
              });
            }}><Text style={s.goldBtnText}>{isDetailFree?'詳細版剩餘'+leftStr:'觀看廣告解鎖7日詳細運程'}</Text></TouchableOpacity>
          </View>
          <NativeBox ready={adsReady} isDark={isDark} />
        </ScrollView>
        <View style={[s.bottomWrapperSafe,{backgroundColor:th.top,borderColor:th.border}]}><View style={[s.tabBar,{backgroundColor:th.top}]}><TouchableOpacity style={s.tab} onPress={function(){goTab('compass');}}><Text style={[s.tabOff,{color:th.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('finance');}}><Text style={[s.tabOff,{color:th.tabOff}]}>財位</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn,{backgroundColor:isDark?'#1e1e1e':'#fff3c0'}]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('settings');}}><Text style={[s.tabOff,{color:th.tabOff}]}>設定</Text></TouchableOpacity></View></View>
      </View>
    );
}return (
    <View style={[s.container,{backgroundColor:th.bg}]}>
      <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
      <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
      <TopBanner ready={adsReady} />
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:130, paddingTop:4}}>
        <View style={[s.topBar,{backgroundColor:th.top,borderColor:th.border}]}><Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>風水佬Go {Math.round(mod(smooth,360))}°</Text><Text style={[s.bigSub,{color:th.sub}]}>今日財神 {daily.caiDir} 喜神 {daily.xiDir} • {currentDir} {fly.star}</Text></View>
        <View style={s.luoPanWrap}>
          <View style={s.luoPanOuter}>
            <View style={[s.luoPan, {transform:[{rotate:(-mod(smooth,360))+"deg"}]}]}>
              <View style={s.luoInner}>
                {MOUNTAINS_INFO.map(function(info,i){
                  var angle = (typeof info.cDeg==="number") ? info.cDeg : getCenterDeg(info);
                  var isActive = currentMountain && currentMountain.m===info.m;
                  return (
                    <View key={info.m} style={[s.markPos, {transform:[{rotate:angle+"deg"}, {translateY:-112}]}]}>
                      <View style={s.markInnerRadial}>
                        <View style={[s.mountainDot, {backgroundColor:info.col}, isActive && s.mountainDotActive]} />
                        <Text style={[s.mountainTextRadial, {color: isActive? '#000' : info.col}, isActive && s.mountainActive]}>{info.m}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={[s.centerDot, {position:'absolute', top:'50%', left:'50%', marginLeft:-27, marginTop:-27, zIndex:10}]}><Text style={{color:'#000',fontWeight:'bold',fontSize:15}}>{currentMountain.m}</Text></View>
          </View>
          <View style={s.fixedNeedleWrap}><View style={s.needleTri} /><View style={s.needleLine} /></View>
          <View style={[s.northBadge,{backgroundColor:th.top,borderColor:'#D4AF37'}]}><Text style={s.northBadgeT}>北 {Math.round(mod(smooth,360))}° {currentDir}</Text></View>
        </View>
        <View style={[s.card, {borderColor: fly.color, borderWidth:1.5, backgroundColor:th.card}]}>
          <Text style={[s.cardTitle, {color:fly.color, fontSize:18}]}>{currentDir} - {fly.star}{fly.name}</Text>
          <Text style={[s.cardDesc,{color:th.text}]}>{fly.desc}</Text>
          <Text style={[s.mountainDetail,{color:th.tabOff}]}>{currentMountain.m}山 {currentMountain.deg}° {currentMountain.wu}行</Text>
          {!unlockedCai? (
            <TouchableOpacity style={s.goldBtn} onPress={function(){setUnlockedCai(true);}}><Text style={s.goldBtnText}>查看佈局</Text></TouchableOpacity>
          ) : (
            <View style={[s.unlockedBox,{backgroundColor:isDark?'#252525':'#fff3c0'}]}>
              <Text style={[s.unlockedText,{color:th.text}]}>{fly.lay} 今日財神{daily.caiDir} 喜神{daily.xiDir}</Text>
              <View style={{flexDirection:'row', marginTop:10}}>
                <TouchableOpacity style={s.smallBtn} onPress={function(){Share.share({message:currentDir+" "+fly.name+" "+fly.lay});}}><Text style={s.smallBtnT}>分享</Text></TouchableOpacity>
                <TouchableOpacity style={[s.smallBtn,{marginLeft:10}]} onPress={function(){setUnlockedCai(false);}}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <NativeBox ready={adsReady} isDark={isDark} />
      </ScrollView>
      <View style={[s.bottomWrapperSafe,{backgroundColor:th.top,borderColor:th.border}]}><View style={[s.tabBar,{backgroundColor:th.top}]}><TouchableOpacity style={[s.tab,s.tabOn,{backgroundColor:isDark?'#1e1e1e':'#fff3c0'}]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('finance');}}><Text style={[s.tabOff,{color:th.tabOff}]}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('bazi');}}><Text style={[s.tabOff,{color:th.tabOff}]}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){goTab('settings');}}><Text style={[s.tabOff,{color:th.tabOff}]}>設定</Text></TouchableOpacity></View></View>
    </View>
  );
}
const s=StyleSheet.create({
  container:{flex:1, alignItems:'center'},
  topAdSmall:{width:'100%', backgroundColor:'transparent', height:52, alignItems:'center', justifyContent:'center', borderBottomWidth:2, borderColor:'#D4AF37'},
  bigTitle:{fontSize:24, fontWeight:'bold', textAlign:'center'}, bigSub:{fontSize:13, marginTop:6, textAlign:'center'},
  topBar:{width:'100%', alignItems:'center', paddingTop:10, paddingBottom:6, borderBottomWidth:1},
  luoPanWrap:{width:320,height:350, alignItems:'center', justifyContent:'center', marginTop:12, position:'relative'},
  luoPanOuter:{width:310,height:310, borderRadius:155, borderWidth:3, borderColor:'#D4AF37', backgroundColor:'#1A1500', alignItems:'center', justifyContent:'center', position:'relative'},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:1, borderColor:'#332800', backgroundColor:'#141414', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  markPos:{position:'absolute', top:'50%', left:'50%', width:36, height:36, marginLeft:-18, marginTop:-18, alignItems:'center'},
  markInnerRadial:{width:36, height:36, alignItems:'center', justifyContent:'center'},
  mountainDot:{width:4,height:4, borderRadius:2, marginBottom:2}, mountainDotActive:{width:6,height:6, borderRadius:3},
  mountainTextRadial:{fontSize:16, fontWeight:'bold', textAlign:'center', lineHeight:18},
  mountainActive:{color:'#000', fontWeight:'bold', fontSize:16, backgroundColor:'#FFD700', borderRadius:7, paddingHorizontal:6, paddingVertical:1},
  centerDot:{width:54,height:54,borderRadius:27,backgroundColor:'#FFD700',alignItems:'center',justifyContent:'center', borderWidth:2, borderColor:'#fff'},
  fixedNeedleWrap:{position:'absolute', top:-2, left:0, right:0, alignItems:'center'},
  needleTri:{width:0, height:0, borderLeftWidth:10, borderRightWidth:10, borderTopWidth:16, borderLeftColor:'transparent', borderRightColor:'transparent', borderTopColor:'#FF3B30'},
  needleLine:{width:2, height:18, backgroundColor:'#FF3B30', marginTop:-2},
  northBadge:{position:'absolute', bottom:0, paddingHorizontal:12, paddingVertical:5, borderRadius:10, borderWidth:1},
  northBadgeT:{color:'#FFD700', fontSize:11, fontWeight:'bold'},
  card:{width:'92%', borderRadius:16, padding:18, marginTop:18, borderWidth:1},
  cardTitle:{fontWeight:'bold'}, cardDesc:{marginTop:8, lineHeight:22, fontSize:15}, mountainDetail:{fontSize:12, marginTop:8},
  goldBtn:{backgroundColor:'#D4AF37', padding:14, borderRadius:12, marginTop:14, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'bold', fontSize:15},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', padding:10, borderRadius:10}, smallBtnT:{color:'#D4AF37', fontSize:13, fontWeight:'bold'},
  unlockedBox:{padding:14, borderRadius:12, marginTop:12}, unlockedText:{fontSize:14, lineHeight:22},
  nativeBox:{width:'92%', borderRadius:14, padding:12, marginTop:18, minHeight:260, borderWidth:1},
  input:{padding:14, borderRadius:10, borderWidth:1, marginTop:12, fontSize:15},
  bottomWrapperSafe:{position:'absolute', bottom:0, width:'100%', borderTopWidth:1, zIndex:99, elevation:99, paddingBottom: Platform.OS==='android'? 50 : 0},
  tabBar:{flexDirection:'row', width:'100%', height:62},
  tab:{flex:1, alignItems:'center', justifyContent:'center', paddingBottom:6}, tabOn:{borderTopWidth:2, borderColor:'#D4AF37'}, tabOnT:{color:'#FFD700', fontWeight:'bold', fontSize:13}, tabOff:{fontSize:13},
  fCard:{width:'100%', borderRadius:14, padding:16, marginTop:12, borderWidth:1}, fCardToday:{borderWidth:2},
  fT:{fontWeight:'bold'}, fD:{fontSize:13, marginTop:8, lineHeight:19}, fL:{color:'#D4AF37', fontSize:13, marginTop:8},
  setCard:{width:'100%', borderRadius:14, padding:16, marginTop:14, borderWidth:1},
  setT:{fontSize:15, fontWeight:'bold'}, setD:{fontSize:13, marginTop:8, lineHeight:20},
});
