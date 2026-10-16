import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, StatusBar, Platform, Linking, Modal, AppState } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, RewardedAd, NativeAd, RewardedAdEventType, AdEventType, NativeAdEventType, NativeAdView, NativeAsset, NativeAssetType, NativeMediaView, MaxAdContentRating, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

let TrackingTransparency = null;
try { TrackingTransparency = require('expo-tracking-transparency'); } catch(e) { TrackingTransparency = null; }

const VERSION = "1.0";
const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const REWARD_ID = "ca-app-pub-9890149028563226/6307389980";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const PRIVACY_URL = 'https://laptime-go.github.io/FungSui-Go/privacy.html';
const SUPPORT_EMAIL = 'mailto:laptime.go@gmail.com';

const DISCLAIMER_TEXT = "本應用所有內容，包括羅盤、財位、八字分析，純屬娛樂參考，不構成投資、醫療、法律或風水專業建議。結果僅供參考，請勿完全依賴。";
const PRIVACY_TEXT = "本應用不會收集、儲存或上傳你的個人資料。八字輸入只保留喺你部手機入面，不會傳送到伺服器。本應用使用Google AdMob，可能會收集裝置廣告ID作廣告用途，詳情見私隱政策。";

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
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"今年偏財位", lay:"正北放清水加6個硬幣。"},
  "東北": {star:"八白", name:"正財位", cai:99, color:"#FFD700", good:true, desc:"今年正財位", lay:"東北放黃水晶同五個銅錢。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"是非位", lay:"放紅色地氈。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"文昌位", lay:"放4枝富貴竹。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"喜慶位", lay:"放9枝紅花。"},
  "西南": {star:"二黑", name:"病位", cai:15, color:"#888", good:false, desc:"病位", lay:"放銅葫蘆。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"破財位", lay:"放清水同藍色地氈。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"貴人位", lay:"放金屬風鈴。"},
};
const THEME = {
  dark: { bg:'#0a0a0a', card:'#1c1c1e', card2:'#161616', text:'#fff', sub:'#D4AF37', top:'#111', border:'#333', input:'#222', tabOff:'#eee' },
  light: { bg:'#f5f3e8', card:'#ffffff', card2:'#fff8e1', text:'#222', sub:'#8a6d00', top:'#ffffff', border:'#e0d5b0', input:'#f0e6c8', tabOff:'#555' }
};
const DIRS8 = ["正北","東北","正東","東南","正南","西南","正西","西北"];

function calcBazi(dateStr, hourIdx){
  try{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    var d=new Date(dateStr); if(isNaN(d.getTime())) return null;
    var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var branches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    var branchWu={子:"水",丑:"土",寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水"};
    var y=d.getFullYear(); var m=d.getMonth()+1; var day=d.getDate();
    var yearStem=stems[(y-4)%10]; var yBranch=branches[(y-4)%12];
    var mStem=stems[(y*2+m+3)%10]; var mBranch=branches[(m+3)%12];
    var base=new Date(1900,0,1).getTime();
    var diff=Math.floor((d.getTime()-base)/86400000);
    var dayStem=stems[(diff+9)%10]; var dayBranch=branches[(diff+1)%12];
    var hBranch=""; var hStem="";
    if(hourIdx!=null && hourIdx>=0){
      hBranch=branches[hourIdx];
      var startMap=[0,2,4,6,8];
      var start=startMap[Math.floor(stems.indexOf(dayStem)/2)%5];
      hStem=stems[(start+hourIdx)%10];
    }
    var map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    var five={木:0,火:0,土:0,金:0,水:0};
    five[map[yearStem]]++; five[branchWu[yBranch]]++;
    five[map[mStem]]++; five[branchWu[mBranch]]++;
    five[map[dayStem]]++; five[branchWu[dayBranch]]++;
    if(hStem) five[map[hStem]]++;
    if(hBranch) five[branchWu[hBranch]]++;
    if(hourIdx!=null && hourIdx>=0){
      five[branchWu[hBranch]]+=2;
      five[Object.keys(five)[hourIdx%5]]+=1;
    }
    var weak=Object.entries(five).sort(function(a,b){return a[1]-b[1];})[0][0];
    var lucky={木:{el:"火",dir:"正南",col:"紅紫色"},火:{el:"土",dir:"西南",col:"黃色"},土:{el:"金",dir:"正西",col:"白金色"},金:{el:"水",dir:"正北",col:"黑藍色"},水:{el:"木",dir:"正東",col:"綠色"}};
    var lk=lucky[weak];
    var hourTxt = hBranch? " "+hStem+hBranch+"時" : " 未定時 三柱";
    return {full:y+"年"+yearStem+yBranch+" "+m+"月"+mStem+mBranch+" "+day+"日"+dayStem+dayBranch+hourTxt+" 日主"+dayStem, five:five, xi:weak, el:lk.el, dir:lk.dir, col:lk.col};
  }catch(err){ return null; }
}
function getDaily(){
  var now=new Date(); var day=now.getDate();
  var yday=Math.floor((now - new Date(now.getFullYear(),0,0))/1000/60/60/24);
  return {date:(now.getMonth()+1)+"月"+day+"日", caiDir:DIRS8[(day*3+yday*2)%8], xiDir:DIRS8[(day*5+3)%8], col:["黑藍","黃金","綠色","紅紫","白金"][day%5]};
}
function getMountainByDeg(deg){
  deg=(deg%360+360)%360;
  for(var i=0;i<MOUNTAINS_INFO.length;i++){
    var info=MOUNTAINS_INFO[i];
    if(info.low>info.high){ if(deg>=info.low || deg<info.high) return info; }
    else { if(deg>=info.low && deg<info.high) return info; }
  }
  return MOUNTAINS_INFO[1];
}
function formatLeft(ms){
  if(ms<0) ms=0;
  var mm=Math.floor(ms/60000);
  var ss=Math.floor((ms%60000)/1000);
  return mm+"分"+(ss<10?"0":"")+ss+"秒";
}const s=StyleSheet.create({
  container:{flex:1, alignItems:'center'},
  topAdSmall:{width:'100%', height:62, alignItems:'center', justifyContent:'center', borderBottomWidth:1, borderColor:'#D4AF37', paddingTop:4},
  adLabel:{fontSize:9, color:'#888', textAlign:'center', marginBottom:2},
  bigTitle:{fontSize:24, fontWeight:'bold', textAlign:'center'}, bigSub:{fontSize:13, marginTop:6, textAlign:'center'},
  topBar:{width:'100%', alignItems:'center', paddingTop:10, paddingBottom:6, borderBottomWidth:1},
  luoPanWrap:{width:320,height:350, alignItems:'center', justifyContent:'center', marginTop:12},
  luoPanOuter:{width:310,height:310, borderRadius:155, borderWidth:3, borderColor:'#D4AF37', backgroundColor:'#1A1500', alignItems:'center', justifyContent:'center'},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:1, borderColor:'#332800', backgroundColor:'#141414', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  markPos:{position:'absolute', top:'50%', left:'50%', width:36, height:36, marginLeft:-18, marginTop:-18, alignItems:'center'},
  markInnerRadial:{width:36, height:36, alignItems:'center', justifyContent:'center'},
  mountainDot:{width:4,height:4, borderRadius:2, marginBottom:2}, mountainDotActive:{width:6,height:6, borderRadius:3},
  mountainTextRadial:{fontSize:16, fontWeight:'bold', textAlign:'center', lineHeight:18},
  mountainActive:{color:'#000', fontWeight:'bold', fontSize:16, backgroundColor:'#FFD700', borderRadius:7, paddingHorizontal:6, paddingVertical:1},
  centerDot:{width:54,height:54,borderRadius:27,backgroundColor:'#FFD700',alignItems:'center',justifyContent:'center', borderWidth:2, borderColor:'#fff'},
  fixedNeedleWrap:{position:'absolute', top:-2, alignItems:'center'},
  needleTri:{width:0, height:0, borderLeftWidth:10, borderRightWidth:10, borderTopWidth:16, borderLeftColor:'transparent', borderRightColor:'transparent', borderTopColor:'#FF3B30'},
  needleLine:{width:2, height:18, backgroundColor:'#FF3B30', marginTop:-2},
  northBadge:{position:'absolute', bottom:0, paddingHorizontal:12, paddingVertical:5, borderRadius:10, borderWidth:1},
  northBadgeT:{color:'#FFD700', fontSize:11, fontWeight:'bold'},
  card:{width:'92%', borderRadius:16, padding:18, marginTop:18, borderWidth:1},
  cardTitle:{fontWeight:'bold'}, cardDesc:{marginTop:8, lineHeight:22, fontSize:15}, mountainDetail:{fontSize:12, marginTop:8},
  goldBtn:{backgroundColor:'#D4AF37', padding:14, borderRadius:12, marginTop:14, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'bold', fontSize:15},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', padding:10, borderRadius:10}, smallBtnT:{color:'#D4AF37', fontSize:13, fontWeight:'bold'},
  unlockedBox:{padding:14, borderRadius:12, marginTop:12}, unlockedText:{fontSize:14, lineHeight:22},
  nativeBox:{width:'92%', borderRadius:14, padding:12, marginTop:18, minHeight:140, borderWidth:1},
  houseAd:{width:'100%', padding:14, borderRadius:10, alignItems:'center', justifyContent:'center'},
  houseAdT:{fontSize:13, fontWeight:'bold', color:'#D4AF37'},
  houseAdD:{fontSize:11, marginTop:4, textAlign:'center'},
  input:{padding:14, borderRadius:10, borderWidth:1, marginTop:12, fontSize:15},
  bottomWrapperSafe:{width:'100%', borderTopWidth:1, backgroundColor:'#111'},
  tabBar:{flexDirection:'row', width:'100%', height:62},
  tab:{flex:1, alignItems:'center', justifyContent:'center', paddingBottom:6}, tabOn:{borderTopWidth:2, borderColor:'#D4AF37'}, tabOnT:{color:'#FFD700', fontWeight:'bold', fontSize:13}, tabOff:{fontSize:13},
  fCard:{width:'100%', borderRadius:14, padding:16, marginTop:12, borderWidth:1}, fCardToday:{borderWidth:2},
  fT:{fontWeight:'bold'}, fD:{fontSize:13, marginTop:8, lineHeight:19}, fL:{color:'#D4AF37', fontSize:13, marginTop:8},
  setCard:{width:'100%', borderRadius:14, padding:16, marginTop:14, borderWidth:1},
  setT:{fontSize:15, fontWeight:'bold'}, setD:{fontSize:13, marginTop:8, lineHeight:20},
  disclaimerBox:{width:'92%', borderRadius:12, padding:12, marginTop:14, borderWidth:1, borderStyle:'dashed'},
  disclaimerT:{fontSize:11, lineHeight:17, textAlign:'center'},
  modalWrap:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.7)', padding:24},
  modalCard:{width:'100%', borderRadius:16, padding:20, borderWidth:1, borderColor:'#D4AF37'},
});

function NativeBox({ready,isDark}){
  const [nativeAd,setNativeAd] = useState(null);
  const [noFill,setNoFill] = useState(false);
  const th = isDark? THEME.dark : THEME.light;
  useEffect(()=>{
    if(!ready) return;
    let curAd = null;
    let alive = true;
    (async ()=>{
      try{
        if(typeof NativeAd.createForAdRequest === 'function'){
          curAd = NativeAd.createForAdRequest(NATIVE_ID);
        } else {
          curAd = new NativeAd(NATIVE_ID);
        }
        curAd.addAdEventListener(NativeAdEventType.LOADED, (a)=>{ if(!alive) return; setNativeAd(a); setNoFill(false); });
        curAd.addAdEventListener(NativeAdEventType.ERROR, ()=>{ if(!alive) return; setNoFill(true); });
        await curAd.load();
      }catch(e){ if(alive) setNoFill(true); }
    })();
    return ()=>{ alive=false; try{ if(curAd && curAd.destroy) curAd.destroy(); }catch(e){} };
  },[ready]);
  if(noFill){
    return (
      <View style={[s.nativeBox,{backgroundColor:th.card2,borderColor:th.border, minHeight:120, alignItems:'center', justifyContent:'center'}]}>
        <View style={[s.houseAd,{backgroundColor:isDark?'#1e1e1e':'#fff8e1'}]}>
          <Text style={s.adLabel}>贊助</Text>
          <Text style={s.houseAdT}>風水佬Go 專業版</Text>
          <Text style={[s.houseAdD,{color:th.tabOff}]}>支持我哋，解鎖全部24山詳細佈局</Text>
        </View>
      </View>
    );
  }
  if(!nativeAd) return null;
  return (
    <View style={[s.nativeBox,{backgroundColor:th.card2,borderColor:th.border}]}>
      <Text style={s.adLabel}>廣告</Text>
      <NativeAdView nativeAd={nativeAd} style={{width:'100%'}}>
        <View style={{flexDirection:'row', width:'100%', alignItems:'center'}}>
          <NativeAsset assetType={NativeAssetType.ICON}><View style={{width:40,height:40,borderRadius:8,overflow:'hidden',backgroundColor:'#222'}}><NativeMediaView style={{width:40,height:40}} /></View></NativeAsset>
          <View style={{marginLeft:10, flex:1}}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}><Text style={{color:isDark?'#FFD700':'#8a6d00',fontWeight:'bold',fontSize:15}}>{nativeAd.headline}</Text></NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}><Text style={{color:th.tabOff,fontSize:11,marginTop:2}}>{nativeAd.advertiser}</Text></NativeAsset>
          </View>
        </View>
        <NativeAsset assetType={NativeAssetType.BODY}><Text style={{color:th.tabOff,fontSize:13,marginTop:8,lineHeight:18}}>{nativeAd.body}</Text></NativeAsset>
        <NativeMediaView style={{width:'100%',height:150,marginTop:10,backgroundColor:'#000',borderRadius:10}} />
        <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%',marginTop:12,alignItems:'center'}}>
          <NativeAsset assetType={NativeAssetType.STAR_RATING}><Text style={{color:'#D4AF37',fontSize:12}}>★ {nativeAd.starRating||5}</Text></NativeAsset>
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}><View style={{backgroundColor:'#D4AF37',paddingHorizontal:18,paddingVertical:8,borderRadius:8}}><Text style={{color:'#000',fontWeight:'bold',fontSize:13}}>{nativeAd.callToAction||'查看'}</Text></View></NativeAsset>
        </View>
      </NativeAdView>
    </View>
  );
}
function TopBanner({ready,isDark}){
  if(!ready) return null;
  var thT = isDark? THEME.dark : THEME.light;
  return (<View style={[s.topAdSmall,{backgroundColor:thT.top}]}><Text style={s.adLabel}>廣告</Text><BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /></View>);
}

function TabBar({active, goTab, isDark, th}){
  var tabs=[{k:'compass',t:'羅盤'},{k:'finance',t:'財位'},{k:'bazi',t:'八字'},{k:'settings',t:'設定'}];
  return (
    <SafeAreaView edges={['bottom']} style={[s.bottomWrapperSafe,{backgroundColor:th.top,borderColor:th.border}]}>
      <View style={[s.tabBar,{backgroundColor:th.top}]}>
        {tabs.map(function(it){
          var isOn = active===it.k;
          return (<TouchableOpacity key={it.k} style={[s.tab, isOn && s.tabOn, isOn && {backgroundColor:isDark?'#1e1e1e':'#fff3c0'}]} onPress={function(){goTab(it.k);}}><Text style={isOn?s.tabOnT:[s.tabOff,{color:th.tabOff}]}>{it.t}</Text></TouchableOpacity>);
        })}
      </View>
    </SafeAreaView>
  );
}

const CompassView = React.memo(function CompassView({smooth, currentMountain, currentDir, fly, daily, unlockedCai, setUnlockedCai, th, isDark, adsReady, onShare}){
  return (
    <>
    <View style={s.luoPanWrap}>
      <View style={s.luoPanOuter}>
        <View style={[s.luoPan, {transform:[{rotate:-smooth+"deg"}]}]}>
          <View style={s.luoInner}>
            {MOUNTAINS_INFO.map(function(info,i){
              var angle = i*15;
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
            <View style={s.centerDot}><Text style={{color:'#000',fontWeight:'bold',fontSize:15}}>{currentMountain.m}</Text></View>
          </View>
        </View>
      </View>
      <View style={s.fixedNeedleWrap}><View style={s.needleTri} /><View style={s.needleLine} /></View>
      <View style={[s.northBadge,{backgroundColor:th.top,borderColor:'#D4AF37'}]}><Text style={s.northBadgeT}>北 {Math.round(smooth)}° {currentDir}</Text></View>
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
            <TouchableOpacity style={s.smallBtn} onPress={onShare}><Text style={s.smallBtnT}>分享</Text></TouchableOpacity>
            <TouchableOpacity style={[s.smallBtn,{marginLeft:10}]} onPress={function(){setUnlockedCai(false);}}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
    <NativeBox ready={adsReady} isDark={isDark} />
    <View style={[s.disclaimerBox,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.disclaimerT,{color:th.tabOff}]}>{DISCLAIMER_TEXT}</Text></View>
    </>
  );
});export default function App(){
  const [tab, setTab] = useState('compass');
  const [heading, setHeading] = useState(0);
  const [smooth, setSmooth] = useState(0);
  const [magDebug, setMagDebug] = useState('');
  const [adsReady, setAdsReady] = useState(false);
  const [interReady, setInterReady] = useState(false);
  const [openReady, setOpenReady] = useState(false);
  const [baziInput, setBaziInput] = useState('');
  const [baziHour, setBaziHour] = useState(null);
  const [baziRes, setBaziRes] = useState(null);
  const [unlockedCai, setUnlockedCai] = useState(false);
  const [lastInter, setLastInter] = useState(0);
  const [lastOpenShow, setLastOpenShow] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [lastBazi, setLastBazi] = useState(Date.now());
  const [baziTick, setBaziTick] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const interRef = useRef(null);
  const rewardRef = useRef(null);
  const openRef = useRef(null);
  const openLoadedAt = useRef(0);
  const appStartRef = useRef(Date.now());
  const lastRaw = useRef(0);
  const magF = useRef({x:0,y:0,z:0});
  const headingRef = useRef(heading);
  headingRef.current = heading;

  const daily = useMemo(function(){return getDaily();},[]);
  const th = isDark? THEME.dark : THEME.light;
  const statusH = Platform.OS==='android'? ((StatusBar.currentHeight||24)+6) : 44;

  useEffect(function(){
    var mSub=null; var first=true; var alive=true;
    (async function(){
      try{
        try{
          var avail = await Magnetometer.isAvailableAsync();
          if(!avail){ if(alive) setMagDebug("此機無羅盤"); return; }
        }catch(e){}
        try{ await Magnetometer.setUpdateIntervalAsync(100); }catch(e){ try{ await Magnetometer.setUpdateInterval(100); }catch(e2){} }
        mSub=Magnetometer.addListener(function(d){
          if(!d ||!alive) return;
          if(first){ magF.current={x:d.x||0,y:d.y||0,z:d.z||0}; first=false; }
          else { magF.current.x=magF.current.x*0.5+(d.x||0)*0.5; magF.current.y=magF.current.y*0.5+(d.y||0)*0.5; }
          var x=magF.current.x; var y=magF.current.y;
          var angle=Math.atan2(y,x)*180/Math.PI; angle=(angle+360)%360; angle=(angle+180)%360;
          var diff=angle-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
          lastRaw.current=(lastRaw.current+diff*0.4+360)%360;
          setHeading(lastRaw.current);
        });
        var sv=await AsyncStorage.getItem('bazi_v1'); if(sv && alive){ setBaziInput(sv); }
        var tm=await AsyncStorage.getItem('theme_v1'); if((tm==='dark' || tm==='light') && alive){ setIsDark(tm==='dark'); }
        var bt=await AsyncStorage.getItem('bazi_unlock_v1'); if(bt && alive){ var bv=parseInt(bt,10); if(!isNaN(bv)) setLastBazi(bv); }
        var seen=await AsyncStorage.getItem('disclaimer_seen_v1'); if(!seen && alive){ setShowDisclaimer(true); }
      }catch(err){}
    })();
    return function(){ alive=false; try{ if(mSub){ mSub.remove(); }catch(err){} } };
  },[]);

  useEffect(function(){
    var t=setInterval(function(){
      setSmooth(function(prev){
        var d=headingRef.current-prev;
        if(d>180)d-=360; if(d<-180)d+=360;
        if(Math.abs(d)>0.2) return (prev+d*0.3+360)%360;
        return prev;
      });
    },50);
    return function(){ clearInterval(t); };
  },[]);

  useEffect(function(){
    if(tab!=='bazi') return;
    var t2=setInterval(function(){ setBaziTick(function(v){return v+1;}); },1000);
    return function(){ clearInterval(t2); };
  },[tab]);

  useEffect(function(){
    var timer=setTimeout(async function(){
      try{
        if(TrackingTransparency && Platform.OS==='ios'){
          try{
            var status = await TrackingTransparency.getTrackingPermissionsAsync();
            if(status.status==='undetermined'){
              await TrackingTransparency.requestTrackingPermissionsAsync();
            }
          }catch(e){}
        }
        await mobileAds().initialize();
        try{ mobileAds().setRequestConfiguration({maxAdContentRating: MaxAdContentRating.G, tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: false}); }catch(e){}
        setAdsReady(true);
        const inter = InterstitialAd.createForAdRequest(INTER_ID);
        interRef.current=inter; inter.load();
        inter.addAdEventListener(AdEventType.LOADED,function(){setInterReady(true);});
        inter.addAdEventListener(AdEventType.CLOSED,function(){ setInterReady(false); try{ inter.load(); }catch(e){} });
        inter.addAdEventListener(AdEventType.ERROR,function(){ setInterReady(false); try{ inter.load(); }catch(e){} });
        const reward = RewardedAd.createForAdRequest(REWARD_ID);
        rewardRef.current=reward; reward.load();
        reward.addAdEventListener(RewardedAdEventType.LOADED,function(){});
        reward.addAdEventListener(AdEventType.CLOSED,function(){ try{ reward.load(); }catch(e){} });
        reward.addAdEventListener(AdEventType.ERROR,function(){ try{ reward.load(); }catch(e){} });
        const open = AppOpenAd.createForAdRequest(OPEN_ID);
        openRef.current=open; open.load();
        open.addAdEventListener(AdEventType.LOADED,function(){ setOpenReady(true); openLoadedAt.current=Date.now(); });
        open.addAdEventListener(AdEventType.CLOSED,function(){ setOpenReady(false); try{ open.load(); }catch(e){} setLastOpenShow(Date.now()); });
        open.addAdEventListener(AdEventType.ERROR,function(){ setOpenReady(false); try{ open.load(); }catch(e){} });
      }catch(err){}
    },1500);
    return function(){ clearTimeout(timer); };
  },[]);

  useEffect(function(){
    var sub=AppState.addEventListener('change', function(next){
      if(next==='active' && openRef.current && openReady){
        var now=Date.now();
        var adAge = now - openLoadedAt.current;
        if(adAge > 3600000){
          try{ openRef.current.load(); }catch(e){}
          setOpenReady(false);
          return;
        }
        if(now-appStartRef.current>30000 && now-lastOpenShow>60000){
          try{ openRef.current.show(); setLastOpenShow(now); setOpenReady(false); }catch(e){}
        }
      }
    });
    return function(){ try{ sub.remove(); }catch(e){} };
  },[openReady,lastOpenShow]);  var currentMountain = useMemo(function(){ return getMountainByDeg(smooth); },[smooth]);
  var currentDir = useMemo(function(){ return DIRS8[Math.round(smooth/45)%8]; },[smooth]);
  var fly = useMemo(function(){ return FLY_2026[currentDir]||FLY_2026["正北"]; },[currentDir]);

  var financeList = useMemo(function(){
    return Object.entries(FLY_2026).sort(function(a,b){return b[1].cai-a[1].cai;});
  },[]);

  var showReward = useCallback(function(cb){
    (async function(){
      if(!rewardRef.current){ Alert.alert("提示","廣告準備中，請稍後再試"); return; }
      try{
        var loaded = true;
        if(typeof rewardRef.current.isLoaded === 'function'){ loaded = await rewardRef.current.isLoaded(); }
        if(!loaded){
          Alert.alert("提示","廣告未準備好，已重新載入，請稍後再試");
          try{ rewardRef.current.load(); }catch(e){}
          return;
        }
        var earned=false;
        var u1=rewardRef.current.addAdEventListener(RewardedAdEventType.EARNED_REWARD,function(){ earned=true; });
        var u2=rewardRef.current.addAdEventListener(AdEventType.CLOSED,function(){
          try{ if(u1) u1(); if(u2) u2(); }catch(e){}
          try{ rewardRef.current.load(); }catch(e){}
          if(earned){
            var now=Date.now(); setLastInter(now); setLastBazi(now); AsyncStorage.setItem('bazi_unlock_v1', String(now)); cb();
          } else { Alert.alert("提示","要睇完廣告先解鎖到，中途按返回係唔會解鎖㗎"); }
        });
        try{ await rewardRef.current.show(); }catch(e){ try{ if(u1) u1(); if(u2) u2(); }catch(e2){} }
      }catch(err){}
    })();
  },[]);

  var goTab = useCallback(async function(t){
    if(t!==tab){
      var now=Date.now();
      if(now-appStartRef.current > 30000 && now-lastInter>120000 && interRef.current){
        try{
          var loaded = true;
          if(typeof interRef.current.isLoaded === 'function'){ loaded = await interRef.current.isLoaded(); }
          if(loaded){
            await interRef.current.show();
            setLastInter(now);
            setInterReady(false);
          }
        }catch(e){ try{ interRef.current.load(); }catch(e2){} }
      }
    }
    setTab(t);
  },[tab,lastInter,interReady]);

  var toggleTheme = useCallback(async function(){
    var nd =!isDark; setIsDark(nd); await AsyncStorage.setItem('theme_v1', nd?'dark':'light');
  },[isDark]);

  var handleShare = useCallback(function(){
    Share.share({message:currentDir+fly.name+" "+fly.lay}).catch(function(){});
  },[currentDir,fly]);

  var handlePrivacy = useCallback(function(){
    Linking.openURL(PRIVACY_URL).catch(function(){ Alert.alert("提示","開唔到私隱頁"); });
  },[]);

  var handleContact = useCallback(function(){
    Linking.openURL(SUPPORT_EMAIL).catch(function(){ Alert.alert("提示","開唔到郵件"); });
  },[]);

  var handleCalibrate = useCallback(function(){
    Alert.alert('校準','遠離磁性物品，平放畫8字');
  },[]);

  var handleAgreeDisclaimer = useCallback(async function(){
    setShowDisclaimer(false);
    await AsyncStorage.setItem('disclaimer_seen_v1','1');
  },[]);

  if(tab==='finance'){
    return (
      <SafeAreaView style={{flex:1, backgroundColor:th.bg}} edges={['top']}>
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} isDark={isDark} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:24}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>財位總覽</Text><Text style={[s.bigSub,{color:th.sub}]}>{daily.date} 財神 {daily.caiDir} 喜神 {daily.xiDir}</Text>
          {financeList.map(function(pair){ var k=pair[0]; var v=pair[1]; var isToday=k===daily.caiDir; return (<View key={k} style={[s.fCard,{backgroundColor:th.card2,borderColor:isToday?v.color:th.border}, isToday && s.fCardToday]}><Text style={[s.fT,{color:v.color, fontSize:17}]}>{k} {v.name} {v.star} {isToday?'★':''}</Text><Text style={[s.fD,{color:th.tabOff}]}>{v.desc}</Text><Text style={s.fL}>{v.lay}</Text></View>); })}
          <View style={[s.disclaimerBox,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.disclaimerT,{color:th.tabOff}]}>{DISCLAIMER_TEXT}</Text></View>
        </ScrollView>
      </View>
      <TabBar active={tab} goTab={goTab} isDark={isDark} th={th} />
      </SafeAreaView>
    );
  }
  if(tab==='settings'){
    return (
      <SafeAreaView style={{flex:1, backgroundColor:th.bg}} edges={['top']}>
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} isDark={isDark} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:24}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>設定 v{VERSION} {isDark?'夜':'日'}</Text><Text style={[s.bigSub,{color:th.sub}]}>{magDebug} {Math.round(smooth)}°</Text>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>外觀模式</Text><Text style={[s.setD,{color:th.tabOff}]}>{isDark?'暗色模式':'日間模式'}</Text><TouchableOpacity style={s.goldBtn} onPress={toggleTheme}><Text style={s.goldBtnText}>{isDark?'切換到 日間':'切換到 暗夜'}</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>羅盤 {Math.round(smooth)}°</Text><Text style={[s.setD,{color:th.tabOff}]}>{currentMountain.m}山 {currentMountain.gua} {currentMountain.wu} {currentMountain.deg}°</Text><TouchableOpacity style={s.goldBtn} onPress={handleCalibrate}><Text style={s.goldBtnText}>校準</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>私隱政策</Text><Text style={[s.setD,{color:th.tabOff}]}>{PRIVACY_TEXT}</Text><TouchableOpacity style={s.goldBtn} onPress={handlePrivacy}><Text style={s.goldBtnText}>查看私隱政策</Text></TouchableOpacity></View>
          <View style={[s.setCard,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.setT,{color:th.text}]}>聯絡我們</Text><Text style={[s.setD,{color:th.tabOff}]}>有任何問題，歡迎聯絡我哋</Text><TouchableOpacity style={s.goldBtn} onPress={handleContact}><Text style={s.goldBtnText}>聯絡我們</Text></TouchableOpacity></View>
          <View style={[s.disclaimerBox,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.disclaimerT,{color:th.tabOff}]}>{DISCLAIMER_TEXT}</Text></View>
        </ScrollView>
      </View>
      <TabBar active={tab} goTab={goTab} isDark={isDark} th={th} />
      </SafeAreaView>
    );
    }  if(tab==='bazi'){
    void baziTick;
    var leftMs = 30*60*1000 - (Date.now()-lastBazi);
    if(leftMs < 0) leftMs = 0;
    var isBaziFree = (Date.now()-lastBazi) < 30*60*1000;
    var leftStr = formatLeft(leftMs);
    return (
      <SafeAreaView style={{flex:1, backgroundColor:th.bg}} edges={['top']}>
      <View style={[s.container,{backgroundColor:th.bg}]}>
        <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
        <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
        <TopBanner ready={adsReady} isDark={isDark} />
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:10,paddingBottom:24}}>
          <Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00',textAlign:'center'}]}>八字</Text><Text style={[s.bigSub,{color:th.sub,textAlign:'center'}]}>今日財神{daily.caiDir} {isBaziFree?'剩餘'+leftStr:''}</Text>
          <View style={[s.card,{width:'100%',backgroundColor:th.card,borderColor:th.border,marginTop:14}]}>
            <TextInput style={[s.input,{backgroundColor:th.input,color:th.text,borderColor:th.border}]} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} />
            <View style={{flexDirection:'row', flexWrap:'wrap', marginTop:10}}>
              {["唔知","子23-1","丑1-3","寅3-5","卯5-7","辰7-9","巳9-11","午11-13","未13-15","申15-17","酉17-19","戌19-21","亥21-23"].map(function(h,idx){
                var isSel = (idx==0 && baziHour==null) || (baziHour==idx-1);
                return (
                  <TouchableOpacity key={h} onPress={function(){ setBaziHour(idx==0?null:idx-1); }} style={{padding:8, paddingHorizontal:10, borderRadius:8, borderWidth:1, borderColor:isSel?'#D4AF37':'#444', backgroundColor:isSel?'#D4AF37':'transparent', margin:4}}>
                    <Text style={{color:isSel?'#000':th.tabOff, fontSize:12, fontWeight:isSel?'bold':'normal'}}>{h}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={s.goldBtn} onPress={function(){
              if(!baziInput){ Alert.alert("提示","請輸入 YYYY-MM-DD"); return; }
              if(isBaziFree){
                var r=calcBazi(baziInput,baziHour);
                if(!r){ setBaziRes({error:"格式 YYYY-MM-DD"}); } else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); }
              } else {
                showReward(function(){
                  var r2=calcBazi(baziInput,baziHour);
                  if(!r2){ setBaziRes({error:"格式 YYYY-MM-DD"}); } else { setBaziRes(r2); AsyncStorage.setItem('bazi_v1',baziInput); }
                });
              }
            }}><Text style={s.goldBtnText}>{isBaziFree?'免費分析（剩餘'+leftStr+'）':'看廣告解鎖30分鐘免費分析'}</Text></TouchableOpacity>
            {baziRes && <View style={[s.unlockedBox,{backgroundColor:isDark?'#252525':'#fff3c0'}]}><Text style={[s.unlockedText,{color:th.text}]}>{baziRes.error?baziRes.error: (baziRes.full+" 喜"+baziRes.xi+" 宜"+baziRes.dir+" "+baziRes.col)}</Text></View>}
            <View style={[s.disclaimerBox,{backgroundColor:th.card2,borderColor:th.border, marginTop:16}]}><Text style={[s.disclaimerT,{color:th.tabOff}]}>{PRIVACY_TEXT}</Text></View>
          </View>
          <NativeBox ready={adsReady} isDark={isDark} />
          <View style={[s.disclaimerBox,{backgroundColor:th.card2,borderColor:th.border}]}><Text style={[s.disclaimerT,{color:th.tabOff}]}>{DISCLAIMER_TEXT}</Text></View>
        </ScrollView>
      </View>
      <TabBar active={tab} goTab={goTab} isDark={isDark} th={th} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{flex:1, backgroundColor:th.bg}} edges={['top']}>
    <View style={[s.container,{backgroundColor:th.bg}]}>
      <StatusBar barStyle={isDark?'light-content':'dark-content'} backgroundColor={th.top} translucent={false} />
      <View style={{height: statusH, backgroundColor: th.top, width:'100%'}} />
      <TopBanner ready={adsReady} isDark={isDark} />
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:24, paddingTop:4}}>
        <View style={[s.topBar,{backgroundColor:th.top,borderColor:th.border}]}><Text style={[s.bigTitle,{color:isDark?'#FFD700':'#8a6d00'}]}>風水佬Go {Math.round(smooth)}°</Text><Text style={[s.bigSub,{color:th.sub}]}>今日財神 {daily.caiDir} 喜神 {daily.xiDir} • {currentDir} {fly.star}</Text></View>
        <CompassView smooth={smooth} currentMountain={currentMountain} currentDir={currentDir} fly={fly} daily={daily} unlockedCai={unlockedCai} setUnlockedCai={setUnlockedCai} th={th} isDark={isDark} adsReady={adsReady} onShare={handleShare} />
      </ScrollView>
    </View>
    <TabBar active={tab} goTab={goTab} isDark={isDark} th={th} />
    <Modal visible={showDisclaimer} transparent={true} animationType="fade" onRequestClose={handleAgreeDisclaimer}>
      <View style={s.modalWrap}>
        <View style={[s.modalCard,{backgroundColor:th.card}]}>
          <Text style={[s.bigTitle,{color:'#D4AF37', fontSize:20}]}>歡迎使用風水佬Go</Text>
          <Text style={[s.setD,{color:th.text, marginTop:12}]}>{DISCLAIMER_TEXT}</Text>
          <Text style={[s.setD,{color:th.tabOff, marginTop:10}]}>{PRIVACY_TEXT}</Text>
          <TouchableOpacity style={s.goldBtn} onPress={handleAgreeDisclaimer}><Text style={s.goldBtnText}>我已了解，開始使用</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
    }
