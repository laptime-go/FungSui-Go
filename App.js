import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, Platform } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, RewardedAd, NativeAd, RewardedAdEventType, AdEventType, NativeAdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BANNER_ID = "ca-app-pub-9890149028563226/7565306387";
const NATIVE_ID = "ca-app-pub-9890149028563226/9108090368";
const INTER_ID = "ca-app-pub-9890149028563226/5859110495";
const REWARD_ID = "ca-app-pub-9890149028563226/6307389980";
const OPEN_ID = "ca-app-pub-9890149028563226/1285440667";
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",cai:"偏財",col:"#4A90E2"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",cai:"帝旺",col:"#4A90E2"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",cai:"橫財",col:"#4A90E2"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",cai:"金庫",col:"#D4AF37"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",cai:"地產",col:"#D4AF37"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",cai:"創業",col:"#51CF66"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",cai:"正財",col:"#51CF66"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",cai:"旺財",col:"#51CF66"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",cai:"小財",col:"#51CF66"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",cai:"財庫",col:"#D4AF37"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",cai:"文昌財",col:"#51CF66"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",cai:"快財",col:"#FF6B6B"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",cai:"名氣財",col:"#FF6B6B"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",cai:"旺財",col:"#FF6B6B"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",cai:"暗財",col:"#FF6B6B"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",cai:"田宅",col:"#D4AF37"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",cai:"財庫位",col:"#D4AF37"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",cai:"貴人財",col:"#C0C0C0"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",cai:"武財",col:"#C0C0C0"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",cai:"兌現",col:"#C0C0C0"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",cai:"珠寶財",col:"#C0C0C0"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",cai:"大庫",col:"#D4AF37"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",cai:"天財",col:"#C0C0C0"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",cai:"長線財",col:"#4A90E2"},
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
};function calcBazi(dateStr){
  try{
    var d=new Date(dateStr); if(isNaN(d.getTime())) return null;
    var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var y=d.getFullYear(); var m=d.getMonth()+1; var day=d.getDate();
    var yearStem=stems[(y-4)%10]; var dayStem=stems[(day*2+m)%10];
    var map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    var five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    var weak=Object.entries(five).sort(function(a,b){return a[1]-b[1];})[0][0];
    var lucky={木:{el:"火",dir:"正南",col:"紅紫色"},火:{el:"土",dir:"西南",col:"黃色"},土:{el:"金",dir:"正西",col:"白金色"},金:{el:"水",dir:"正北",col:"黑藍色"},水:{el:"木",dir:"正東",col:"綠色"}};
    var lk=lucky[weak];
    return {full:y+"年 "+yearStem+"命 日主"+dayStem, five:five, xi:weak, el:lk.el, dir:lk.dir, col:lk.col};
  }catch(err){ return null; }
}
function getDaily(){
  var now=new Date(); var day=now.getDate();
  var yday=Math.floor((now - new Date(now.getFullYear(),0,0))/1000/60/60/24);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"];
  return {date:(now.getMonth()+1)+"月"+day+"日", caiDir:dirs[(day*3+yday*2)%8], xiDir:dirs[(day*5+3)%8], col:["黑藍","黃金","綠色","紅紫","白金"][day%5]};
}
function NativeBox({ready}){
  var _n1=useState(null); var ad=_n1[0]; var setAd=_n1[1];
  var _n2=useState(false); var fail=_n2[0]; var setFail=_n2[1];
  useEffect(function(){
    if(!ready) return;
    try{
      var n=NativeAd.createForAdRequest(NATIVE_ID);
      n.addAdEventListener(NativeAdEventType.LOADED,function(a){ setAd(a); });
      n.addAdEventListener(NativeAdEventType.ERROR,function(){ setFail(true); });
      n.load();
    }catch(e){ setFail(true); }
  },[ready]);
  if(fail){
    return <View style={s.nativeBox}><BannerAd unitId={BANNER_ID} size={BannerAdSize.MEDIUM_RECTANGLE} /></View>;
  }
  if(!ad) return <View style={s.nativeBox}><Text style={s.adLabel}>推薦內容準備中</Text><View style={{marginTop:10, backgroundColor:'#222', width:'100%', height:110, borderRadius:8}} /></View>;
  return (
    <View style={s.nativeBox}>
      <Text style={{color:'#FFD700', fontWeight:'bold', fontSize:16}}>{ad.headline||'推薦'}</Text>
      <Text style={{color:'#aaa', fontSize:13, marginTop:6, lineHeight:18}}>{ad.body||''}</Text>
      <View style={{marginTop:10, backgroundColor:'#D4AF37', paddingHorizontal:16, paddingVertical:6, borderRadius:6}}>
        <Text style={{color:'#000', fontWeight:'bold', fontSize:12}}>查看</Text>
      </View>
    </View>
  );
}export default function App(){
  var _s1=useState('compass'); var tab=_s1[0]; var setTab=_s1[1];
  var _s2=useState(0); var heading=_s2[0]; var setHeading=_s2[1];
  var _s3=useState(0); var smooth=_s3[0]; var setSmooth=_s3[1];
  var _s4=useState(''); var magDebug=_s4[0]; var setMagDebug=_s4[1];
  var _s5=useState(false); var adsReady=_s5[0]; var setAdsReady=_s5[1];
  var _s6=useState(false); var interReady=_s6[0]; var setInterReady=_s6[1];
  var _s7=useState(''); var baziInput=_s7[0]; var setBaziInput=_s7[1];
  var _s8=useState(null); var baziRes=_s8[0]; var setBaziRes=_s8[1];
  var _s9=useState(false); var unlockedCai=_s9[0]; var setUnlockedCai=_s9[1];
  var _s10=useState(0); var lastInter=_s10[0]; var setLastInter=_s10[1];
  var _s11=useState(false); var rewardReady=_s11[0]; var setRewardReady=_s11[1];
  var interRef=useRef(null); var rewardRef=useRef(null); var appOpenRef=useRef(null); var lastRaw=useRef(0); var magF=useRef({x:0,y:0,z:0});
  var daily=useMemo(function(){return getDaily();},[]);
  useEffect(function(){
    var mSub=null; var aSub=null; var first=true;
    (async function(){
      try{
        try{ await Magnetometer.setUpdateIntervalAsync(100); }catch(e){ await Magnetometer.setUpdateInterval(100); }
        try{ await Accelerometer.setUpdateIntervalAsync(200); }catch(e){ await Accelerometer.setUpdateInterval(200); }
        aSub=Accelerometer.addListener(function(){});
        mSub=Magnetometer.addListener(function(d){
          if(!d) return;
          if(first){ magF.current={x:d.x||0,y:d.y||0,z:d.z||0}; first=false; }
          else { magF.current.x=magF.current.x*0.5+(d.x||0)*0.5; magF.current.y=magF.current.y*0.5+(d.y||0)*0.5; }
          var x=magF.current.x; var y=magF.current.y;
          setMagDebug(daily.caiDir+" "+daily.xiDir);
          var angle=Math.atan2(y,x)*180/Math.PI; angle=(angle+360)%360; angle=(angle+180)%360;
          var diff=angle-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
          lastRaw.current=(lastRaw.current+diff*0.4+360)%360;
          setHeading(lastRaw.current);
        });
        var sv=await AsyncStorage.getItem('bazi_v1'); if(sv){ setBaziInput(sv); }
      }catch(err){}
    })();
    return function(){ try{ if(mSub){ mSub.remove(); } if(aSub){ aSub.remove(); } }catch(err){} };
  },[]);
  useEffect(function(){ var t=setInterval(function(){ var d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.2) setSmooth(function(v){return (v+d*0.3+360)%360;}); },33); return function(){ clearInterval(t); }; },[heading,smooth]);
  useEffect(function(){ setTimeout(async function(){
    try{
      await mobileAds().initialize(); setAdsReady(true);
      const inter = InterstitialAd.createForAdRequest(INTER_ID);
      interRef.current=inter; inter.load();
      inter.addAdEventListener(AdEventType.LOADED,function(){setInterReady(true);});
      inter.addAdEventListener(AdEventType.CLOSED,function(){ inter.load(); });
      const reward = RewardedAd.createForAdRequest(REWARD_ID);
      rewardRef.current=reward; reward.load();
      reward.addAdEventListener(RewardedAdEventType.LOADED,function(){setRewardReady(true);});
      reward.addAdEventListener(AdEventType.CLOSED,function(){ reward.load(); });
      const appOpenAd = AppOpenAd.createForAdRequest(OPEN_ID);
      appOpenRef.current=appOpenAd;
      appOpenAd.addAdEventListener(AdEventType.LOADED,function(){ setTimeout(function(){ try{ appOpenAd.show(); }catch(e){} },800); });
      appOpenAd.load();
    }catch(err){}
  },1000); },[]);
  var currentMountain=useMemo(function(){ var i=(Math.floor((smooth+7.5)/15)+1)%24; return MOUNTAINS_INFO[i%24]||MOUNTAINS_INFO[0]; },[smooth]);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; var currentDir=dirs[Math.round(smooth/45)%8]; var fly=FLY_2026[currentDir]||FLY_2026["正北"];
  var showReward=function(cb){
    if(Date.now()-lastInter<60000){ Alert.alert("提示","60秒後再試"); return; }
    if(rewardReady&&rewardRef.current){
      var earned=false;
      var u1=rewardRef.current.addAdEventListener(RewardedAdEventType.EARNED_REWARD,function(){ earned=true; });
      var u2=rewardRef.current.addAdEventListener(AdEventType.CLOSED,function(){ u1(); u2(); if(earned){ setLastInter(Date.now()); cb(); } else { Alert.alert("提示","請看完廣告"); } });
      rewardRef.current.show().catch(function(){ Alert.alert("提示","廣告準備中"); });
    } else { Alert.alert("提示","廣告準備中"); try{ rewardRef.current&&rewardRef.current.load(); }catch(e){} }
  };
  var showInter=function(cb){ if(interReady&&interRef.current){ var s=interRef.current.addAdEventListener(AdEventType.CLOSED,function(){ s(); cb(); }); interRef.current.show().catch(function(){ cb(); }); } else { cb(); } };  if(tab==='finance'){
    var list = Object.entries(FLY_2026).sort(function(a,b){return b[1].cai-a[1].cai;});
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:25,paddingBottom:140}}>
          <Text style={s.bigTitle}>財位總覽</Text><Text style={s.bigSub}>{daily.date} 財神 {daily.caiDir} 喜神 {daily.xiDir}</Text>
          {list.map(function(pair){ var k=pair[0]; var v=pair[1]; var isToday=k===daily.caiDir; return (<View key={k} style={[s.fCard, isToday && s.fCardToday, {borderColor:v.color}]}><Text style={[s.fT,{color:v.color, fontSize:17}]}>{k} {v.name} {v.star} {isToday?'★':''}</Text><Text style={s.fD}>{v.desc}</Text><Text style={s.fL}>{v.lay}</Text></View>); })}
        </ScrollView>
        <View style={s.bottomWrapper}>
          <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('settings');}}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
          <View style={s.bottomAd}>{adsReady && <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />}</View>
        </View>
      </View>
    );
  }
  if(tab==='settings'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:25,paddingBottom:140}}>
          <Text style={s.bigTitle}>設定 v1.0</Text><Text style={s.bigSub}>{magDebug} {Math.round(smooth)}°</Text>
          <View style={s.setCard}><Text style={s.setT}>羅盤 {Math.round(smooth)}°</Text><Text style={s.setD}>{currentMountain.m}山 {currentMountain.gua} {currentMountain.wu} {currentMountain.deg}°</Text><TouchableOpacity style={s.goldBtn} onPress={function(){Alert.alert('校準','遠離磁性物品，平放畫8字');}}><Text style={s.goldBtnText}>校準</Text></TouchableOpacity></View>
          <View style={s.setCard}><Text style={s.setT}>儲存</Text><Text style={s.setD}>{baziInput||'未設定'}</Text><TouchableOpacity style={s.darkBtn} onPress={async function(){ if(baziInput){ await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存'); }}}><Text style={s.darkBtnText}>儲存</Text></TouchableOpacity><TouchableOpacity style={[s.darkBtn,{marginTop:8}]} onPress={async function(){ await AsyncStorage.clear(); setBaziInput(''); Alert.alert('已清除');}}><Text style={s.darkBtnText}>清除</Text></TouchableOpacity></View>
        </ScrollView>
        <View style={s.bottomWrapper}>
          <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View>
          <View style={s.bottomAd}>{adsReady && <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />}</View>
        </View>
      </View>
    );
  }
  if(tab==='bazi'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:25,paddingBottom:140}}>
          <Text style={s.bigTitle}>八字</Text><Text style={s.bigSub}>今日財神{daily.caiDir}</Text>
          <View style={[s.card,{width:'92%'}]}><TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} /><TouchableOpacity style={s.goldBtn} onPress={function(){ var r=calcBazi(baziInput); if(!r){ setBaziRes({error:"格式 YYYY-MM-DD"}); } else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); showInter(function(){}); }}}><Text style={s.goldBtnText}>分析</Text></TouchableOpacity>{baziRes && <View style={s.unlockedBox}><Text style={s.unlockedText}>{baziRes.error?baziRes.error: (baziRes.full+" 喜"+baziRes.xi+" 宜"+baziRes.dir+" "+baziRes.col)}</Text></View>}</View>
          <NativeBox ready={adsReady} />
        </ScrollView>
        <View style={s.bottomWrapper}>
          <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>財位</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('settings');}}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
          <View style={s.bottomAd}>{adsReady && <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />}</View>
        </View>
      </View>
    );
  }
  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:10}}>
        <View style={s.topBar}><Text style={s.bigTitle}>風水佬Go {Math.round(smooth)}°</Text><Text style={s.bigSub}>今日財神 {daily.caiDir} 喜神 {daily.xiDir} • {currentDir} {fly.star}</Text></View>
        <View style={s.luoPanWrap}>
          <View style={s.luoPanOuter}>
            <View style={[s.luoPan, {transform:[{rotate:""+(-smooth)+"deg"}]}]}>
              <View style={s.luoInner}>
                {MOUNTAINS_INFO.map(function(info,i){ var active=currentMountain && currentMountain.m===info.m; var upright = -i*15 + smooth; return (
                  <View key={info.m} style={[s.mountainMark, {transform:[{rotate:""+(i*15)+"deg"}, {translateY:-118}]}]}>
                    <View style={{transform:[{rotate:""+upright+"deg"}], alignItems:'center'}}>
                      <View style={[s.mountainDot, {backgroundColor:info.col}, active && s.mountainDotActive]} />
                      <Text style={[s.mountainText, {color: active? '#000' : info.col}, active && s.mountainActive]}>{info.m}</Text>
                    </View>
                  </View>
                ); })}
                <View style={s.centerDot}><Text style={{color:'#000',fontWeight:'bold',fontSize:14}}>{currentMountain.m}</Text></View>
              </View>
            </View>
          </View>
          <View style={s.fixedNeedleWrap}><View style={s.needleTri} /><View style={s.needleLine} /></View>
          <View style={s.northBadge}><Text style={s.northBadgeT}>北 {Math.round(smooth)}° {currentDir}</Text></View>
        </View>
        <View style={[s.card, {borderColor: fly.color, borderWidth:1.5}]}><Text style={[s.cardTitle, {color:fly.color, fontSize:18}]}>{currentDir} - {fly.star}{fly.name}</Text><Text style={[s.cardDesc,{fontSize:15}]}>{fly.desc}</Text><Text style={s.mountainDetail}>{currentMountain.m}山 {currentMountain.deg}° {currentMountain.wu}行</Text>{!unlockedCai? (<TouchableOpacity style={s.goldBtn} onPress={function(){showReward(function(){setUnlockedCai(true);});}}><Text style={s.goldBtnText}>看廣告解鎖佈局</Text></TouchableOpacity>) : (<View style={s.unlockedBox}><Text style={s.unlockedText}>{fly.lay} 今日財神{daily.caiDir} 喜神{daily.xiDir}</Text><View style={{flexDirection:'row', marginTop:10}}><TouchableOpacity style={s.smallBtn} onPress={function(){Share.share({message:currentDir+fly.name+" "+fly.lay});}}><Text style={s.smallBtnT}>分享</Text></TouchableOpacity><TouchableOpacity style={[s.smallBtn,{marginLeft:10}]} onPress={function(){setUnlockedCai(false);}}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity></View></View>)}</View>
        <NativeBox ready={adsReady} />
      </ScrollView>
      <View style={s.bottomWrapper}>
        <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={s.tabOff}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('settings');}}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />}</View>
      </View>
    </View>
  );
    }const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0a0a0a', alignItems:'center'},
  bigTitle:{color:'#FFD700', fontSize:24, fontWeight:'bold', textAlign:'center'}, bigSub:{color:'#D4AF37', fontSize:13, marginTop:6, textAlign:'center'},
  topBar:{width:'100%', alignItems:'center', paddingTop:18, paddingBottom:8, backgroundColor:'#111', borderBottomWidth:1, borderColor:'#222'},
  luoPanWrap:{width:320,height:350, alignItems:'center', justifyContent:'center', marginTop:18},
  luoPanOuter:{width:310,height:310, borderRadius:155, borderWidth:3, borderColor:'#D4AF37', backgroundColor:'#1A1500', alignItems:'center', justifyContent:'center'},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:1, borderColor:'#332800', backgroundColor:'#141414', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  mountainMark:{position:'absolute', top:'50%', left:'50%', width:24, marginLeft:-12, marginTop:-12, alignItems:'center'},
  mountainDot:{width:4,height:4, borderRadius:2, marginBottom:2}, mountainDotActive:{width:6,height:6, borderRadius:3},
  mountainText:{color:'#888', fontSize:13}, mountainActive:{color:'#000', fontWeight:'bold', fontSize:15, backgroundColor:'#FFD700', borderRadius:6, paddingHorizontal:5, paddingVertical:1},
  centerDot:{width:52,height:52,borderRadius:26,backgroundColor:'#FFD700',alignItems:'center',justifyContent:'center', borderWidth:2, borderColor:'#fff'},
  fixedNeedleWrap:{position:'absolute', top:-2, alignItems:'center'},
  needleTri:{width:0, height:0, borderLeftWidth:10, borderRightWidth:10, borderTopWidth:16, borderLeftColor:'transparent', borderRightColor:'transparent', borderTopColor:'#FF3B30'},
  needleLine:{width:2, height:18, backgroundColor:'#FF3B30', marginTop:-2},
  northBadge:{position:'absolute', bottom:0, backgroundColor:'#111', paddingHorizontal:12, paddingVertical:5, borderRadius:10, borderWidth:1, borderColor:'#D4AF37'},
  northBadgeT:{color:'#FFD700', fontSize:11, fontWeight:'bold'},
  card:{width:'92%', backgroundColor:'#1c1c1e', borderRadius:16, padding:18, marginTop:18, borderWidth:1, borderColor:'#333'},
  cardTitle:{fontWeight:'bold'}, cardDesc:{color:'#ddd', marginTop:8, lineHeight:22}, mountainDetail:{color:'#888', fontSize:12, marginTop:8},
  goldBtn:{backgroundColor:'#D4AF37', padding:14, borderRadius:12, marginTop:14, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'bold', fontSize:15},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', padding:10, borderRadius:10}, smallBtnT:{color:'#D4AF37', fontSize:13, fontWeight:'bold'},
  unlockedBox:{backgroundColor:'#252525', padding:14, borderRadius:12, marginTop:12}, unlockedText:{color:'#eee', fontSize:14, lineHeight:22},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:14, padding:16, marginTop:18, minHeight:180, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  adLabel:{color:'#666', fontSize:11, marginBottom:6}, input:{backgroundColor:'#222', color:'#fff', padding:14, borderRadius:10, borderWidth:1, borderColor:'#333', marginTop:12, fontSize:15},
  // 電話功能鍵修復重點
  bottomWrapper:{position:'absolute', bottom:0, width:'100%', backgroundColor:'#111', borderTopWidth:1, borderColor:'#222', zIndex:99, elevation:99},
  tabBar:{flexDirection:'row', width:'100%', height:56, backgroundColor:'#111'},
  bottomAd:{width:'100%', alignItems:'center', backgroundColor:'#000', height:84, paddingBottom:24, justifyContent:'center'},
  tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#1e1e1e', borderTopWidth:2, borderColor:'#D4AF37'}, tabOnT:{color:'#D4AF37', fontWeight:'bold', fontSize:13}, tabOff:{color:'#777', fontSize:13},
  fCard:{width:'100%', backgroundColor:'#161616', borderRadius:14, padding:16, marginTop:12, borderWidth:1, borderColor:'#2a2a2a'}, fCardToday:{backgroundColor:'#1a1708', borderWidth:2},
  fT:{fontWeight:'bold'}, fD:{color:'#aaa', fontSize:13, marginTop:8, lineHeight:19}, fL:{color:'#D4AF37', fontSize:13, marginTop:8},
  setCard:{width:'100%', backgroundColor:'#161616', borderRadius:14, padding:16, marginTop:14, borderWidth:1, borderColor:'#2a2a2a'},
  setT:{color:'#fff', fontSize:15, fontWeight:'bold'}, setD:{color:'#999', fontSize:13, marginTop:8, lineHeight:20},
  darkBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', padding:13, borderRadius:11, marginTop:12, alignItems:'center'}, darkBtnText:{color:'#D4AF37', fontWeight:'bold', fontSize:14},
});
