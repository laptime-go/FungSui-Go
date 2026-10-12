import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, Vibration, Switch, Animated } from 'react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
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
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",cai:"偏財"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",cai:"帝旺"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",cai:"橫財"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",cai:"金庫"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",cai:"地產"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",cai:"創業"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",cai:"正財"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",cai:"旺財"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",cai:"小財"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",cai:"財庫"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",cai:"文昌財"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",cai:"快財"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",cai:"名氣財"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",cai:"旺財"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",cai:"暗財"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",cai:"田宅"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",cai:"財庫位"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",cai:"貴人財"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",cai:"武財"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",cai:"兌現"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",cai:"珠寶財"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",cai:"大庫"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",cai:"天財"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",cai:"長線財"},
];
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"一白入正北，今年最大偏財", lay:"正北放一杯清水+6枚硬幣，養黑魚，錢包向北，忌紅。"},
  "東北": {star:"八白", name:"正財帝位", cai:99, color:"#FFD700", good:true, desc:"八白帝星，正財最旺", lay:"東北放黃水晶聚寶盆+五帝錢，保險箱放此，最旺。"},
  "正東": {star:"三碧", name:"是非位", cai:20, color:"#FF6B6B", good:false, desc:"三碧是非位，合約要小心", lay:"放紅地氈+紅燈，文件用紅色，忌魚缸。"},
  "東南": {star:"四綠", name:"文昌位", cai:82, color:"#51CF66", good:true, desc:"文昌位，考試直播最利", lay:"四枝富貴竹+文昌塔放東南，向東南寫嘢直播。"},
  "正南": {star:"九紫", name:"喜慶位", cai:90, color:"#FF69B4", good:true, desc:"九紫喜慶，人緣帶財", lay:"9枝紅花+暖燈放正南，喜慶直播帶貨。"},
  "西南": {star:"二黑", name:"病符位", cai:15, color:"#888", good:false, desc:"病符位，注意健康破財", lay:"銅葫蘆+五帝錢，保持乾淨。"},
  "正西": {star:"七赤", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤破財，防盜防騙", lay:"一杯清水+藍地氈，錢包唔放西。"},
  "西北": {star:"六白", name:"貴人位", cai:88, color:"#D4AF37", good:true, desc:"六白貴人，談生意最旺", lay:"金屬風鈴+六帝錢放西北，向西北坐談生意。"},
};
function getDaily(){
  var now=new Date(); var day=now.getDate();
  var yday=Math.floor((now - new Date(now.getFullYear(),0,0))/1000/60/60/24);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"];
  var cai=dirs[(day*3+yday*2)%8]; var xi=dirs[(day*5+3)%8];
  var colors=["黑藍","黃金","綠色","紅紫","白金"]; var col=colors[day%5];
  var nums=["1,6","2,7","3,8","4,9","5,0"]; var num=nums[day%5];
  var hours=[["11:00-13:00","午時最旺"], ["13:00-15:00","未時見貴"], ["09:00-11:00","巳時偏財"]];
  var h=hours[day%3];
  return {date:(now.getMonth()+1)+"月"+day+"日", caiDir:cai, xiDir:xi, col:col, num:num, hour:h[0], hourName:h[1], score: 85 + (day%15)};
}
function calcBazi(dateStr){
  try{
    var d=new Date(dateStr); if(isNaN(d.getTime())) return null;
    var stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    var y=d.getFullYear(); var m=d.getMonth()+1; var day=d.getDate();
    var yearStem=stems[(y-4)%10]; var dayStem=stems[(day*2+m)%10];
    var map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    var five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    var weak=Object.entries(five).sort(function(a,b){return a[1]-b[1];})[0][0];
    var lucky={木:{el:"火",dir:"正南",col:"紅紫色"},火:{el:"土",dir:"西南",col:"黃色"},土:{el:"金",dir:"正西",col:"白金色"},金:{el:"水",dir:"正北",col:"黑藍色"},水:{el:"木",dir:"正東",col:"綠色"}};
    return {full:y+"年 "+yearStem+"命 日主"+dayStem, xi:weak, dir:lucky[weak].dir, col:lucky[weak].col};
  }catch(err){ return null; }
}

export default function App(){
  var _s1=useState('compass'); var tab=_s1[0]; var setTab=_s1[1];
  var _s2=useState(0); var heading=_s2[0]; var setHeading=_s2[1];
  var _s3=useState(0); var smooth=_s3[0]; var setSmooth=_s3[1];
  var _s4=useState('等待感應器...'); var magDebug=_s4[0]; var setMagDebug=_s4[1];
  var _s5=useState(false); var adsReady=_s5[0]; var setAdsReady=_s5[1];
  var _s6=useState(false); var interReady=_s6[0]; var setInterReady=_s6[1];
  var _s7=useState(''); var baziInput=_s7[0]; var setBaziInput=_s7[1];
  var _s8=useState(null); var baziRes=_s8[0]; var setBaziRes=_s8[1];
  var _s9=useState(false); var unlockedCai=_s9[0]; var setUnlockedCai=_s9[1];
  var _s10=useState(0); var lastInter=_s10[0]; var setLastInter=_s10[1];
  var _s11=useState(false); var isDark=_s11[0]; var setIsDark=_s11[1];
  var _s12=useState(false); var locked=_s12[0]; var setLocked=_s12[1];
  var pulse=useRef(new Animated.Value(1)).current;
  var interRef=useRef(null); var lastRaw=useRef(0); var magF=useRef({x:0,y:0,z:0});
  var daily=useMemo(function(){return getDaily();},[]);

  useEffect(function(){
    Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.08,duration:900,useNativeDriver:true}), Animated.timing(pulse,{toValue:1,duration:900,useNativeDriver:true})])).start();
  },[]);
  useEffect(function(){
    var mSub=null; var aSub=null; var first=true;
    (async function(){
      try{
        try{ await Magnetometer.setUpdateIntervalAsync(100); }catch(e){ await Magnetometer.setUpdateInterval(100); }
        try{ await Accelerometer.setUpdateIntervalAsync(200); }catch(e){ await Accelerometer.setUpdateInterval(200); }
        aSub=Accelerometer.addListener(function(){});
        mSub=Magnetometer.addListener(function(d){
          if(locked) return;
          if(first){ magF.current={x:d.x,y:d.y,z:d.z}; first=false; }
          else { magF.current.x=magF.current.x*0.5+d.x*0.5; magF.current.y=magF.current.y*0.5+d.y*0.5; }
          var x=magF.current.x; var y=magF.current.y;
          setMagDebug("強度"+Math.hypot(x,y).toFixed(0));
          var angle=Math.atan2(y,x)*180/Math.PI; angle=(angle+360)%360; angle=(angle+180)%360;
          var diff=angle-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
          lastRaw.current=(lastRaw.current+diff*0.4+360)%360;
          setHeading(lastRaw.current);
        });
        var sv=await AsyncStorage.getItem('bazi_v1'); if(sv){ setBaziInput(sv); }
        var th=await AsyncStorage.getItem('theme_v1'); if(th){ setIsDark(th==='dark'); }
      }catch(err){ setMagDebug('感應器錯誤:'+err.message); }
    })();
    return function(){ try{ if(mSub){ mSub.remove(); } if(aSub){ aSub.remove(); } }catch(err){} };
  },[locked]);
  useEffect(function(){ var t=setInterval(function(){ var d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.2) setSmooth(function(v){return (v+d*0.3+360)%360;}); },33); return function(){ clearInterval(t); }; },[heading,smooth]);
  useEffect(function(){ setTimeout(async function(){ try{ await mobileAds().initialize(); setAdsReady(true); var inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true}); interRef.current=inter; inter.load(); inter.addAdEventListener(AdEventType.LOADED,function(){setInterReady(true);}); inter.addAdEventListener(AdEventType.CLOSED,function(){ setLastInter(Date.now()); inter.load(); }); AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load(); }catch(err){} },800); },[]);

  var currentMountain=useMemo(function(){ var i=Math.floor((smooth+7.5)/15)%24; return MOUNTAINS_INFO[i]||MOUNTAINS_INFO[0]; },[smooth]);
  var dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; var currentDir=dirs[Math.round(smooth/45)%8]; var fly=FLY_2026[currentDir]||FLY_2026["正北"];
  var showInter=function(cb){ Alert.alert("解鎖佈局","睇15秒廣告解鎖今日催財秘法",[{text:"取消",style:"cancel"},{text:"立即解鎖",onPress:function(){ var now=Date.now(); if(interReady&&now-lastInter>25000&&interRef.current){ var u=interRef.current.addAdEventListener(AdEventType.CLOSED,function(){cb();u();}); interRef.current.show().catch(function(){cb();}); } else cb(); }}]); };
  var theme=isDark?darkTheme:lightTheme;
  var toggleTheme=async function(v){ setIsDark(v); await AsyncStorage.setItem('theme_v1', v?'dark':'light'); };
  var onCuicai=function(){ Vibration.vibrate([0,40,30,80]); Share.share({message:"風水佬Go • 今日財運"+daily.score+"% • 財神在"+daily.caiDir+" 穿"+daily.col+" 吉時"+daily.hour+" • "+currentDir+fly.name+" • "+fly.lay}); };

  if(tab==='finance'){
    return (
      <View style={[s.container,{backgroundColor:theme.bg}]}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:20,paddingBottom:160}}>
          <Text style={[s.bigTitle,{color:theme.gold}]}>財位總覽</Text><Text style={[s.bigSub,{color:theme.sub}]}>{daily.date} 財神 {daily.caiDir} 喜神 {daily.xiDir} • 穿{daily.col} 幸運 {daily.num}</Text>
          <View style={[s.scoreBanner,{backgroundColor:theme.card, borderColor:theme.gold}]}><Text style={s.scoreLabel}>今日偏財指數</Text><Text style={s.scoreNum}>{daily.score}%</Text><Text style={[s.scoreSub,{color:theme.text2}]}>吉時 {daily.hour} 向{daily.caiDir}最旺 • 穿{daily.col}</Text></View>
          {Object.entries(FLY_2026).sort(function(a,b){return b[1].cai-a[1].cai;}).map(function(pair){ var k=pair[0]; var v=pair[1]; var isToday=k===daily.caiDir; return (<View key={k} style={[s.fCard,{backgroundColor:theme.card, borderColor:isToday?theme.gold:theme.border}, isToday && {borderWidth:2, shadowColor:theme.gold, shadowOpacity:0.2, shadowRadius:8, elevation:4}]}><View style={{flexDirection:'row', justifyContent:'space-between'}}><Text style={[s.fT,{color:isToday?theme.gold:v.color}]}>{k} {v.name}</Text><View style={{flexDirection:'row'}}><Text style={{color:v.color, fontWeight:'bold'}}>{v.cai}%</Text>{isToday && <View style={[s.badge,{marginLeft:8}]}><Text style={s.badgeT}>今日財神</Text></View>}</View></View><Text style={[s.fD,{color:theme.text2}]}>{v.desc}</Text><Text style={[s.fL,{color:theme.text}]}>{v.lay}</Text></View>); })}
        </ScrollView>
        <View style={[s.tabBar,{backgroundColor:theme.tab, borderColor:theme.border}]}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={[s.tabOnT,{color:theme.gold}]}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('settings');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='settings'){
    return (
      <View style={[s.container,{backgroundColor:theme.bg}]}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:20,paddingBottom:160}}>
          <Text style={[s.bigTitle,{color:theme.gold}]}>設定</Text>
          <View style={[s.setCard,{backgroundColor:theme.card, borderColor:theme.border}]}><View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}><View><Text style={[s.setT,{color:theme.text}]}>日夜模式</Text><Text style={[s.setD,{color:theme.text2, marginTop:2}]}>{isDark?'黑金護眼':'白金清晰'}</Text></View><Switch value={isDark} onValueChange={toggleTheme} thumbColor={theme.gold} trackColor={{false:'#ccc', true:'#332800'}} /></View></View>
          <View style={[s.setCard,{backgroundColor:theme.card, borderColor:theme.border}]}><Text style={[s.setT,{color:theme.text}]}>羅盤 {Math.round(smooth)}° 已校準</Text><Text style={[s.setD,{color:theme.text2}]}>坐{currentMountain.m}山 {currentMountain.deg}° {currentMountain.wu}行{'\n'}財神 {daily.caiDir} 喜神 {daily.xiDir} {daily.col} {daily.num}號{'\n'}{magDebug}</Text></View>
          <View style={[s.setCard,{backgroundColor:theme.card, borderColor:theme.border}]}><Text style={[s.setT,{color:theme.text}]}>八字資料</Text><Text style={[s.setD,{color:theme.text2}]}>{baziInput||'未設定 YYYY-MM-DD'}</Text><View style={{flexDirection:'row', marginTop:10}}><TouchableOpacity style={[s.miniBtn,{backgroundColor:theme.gold}]} onPress={async function(){ if(baziInput){ await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存'); }}}><Text style={s.miniBtnT}>儲存</Text></TouchableOpacity><TouchableOpacity style={[s.miniBtn,{marginLeft:8, backgroundColor:theme.border}]} onPress={async function(){ await AsyncStorage.clear(); setBaziInput(''); Alert.alert('已清除');}}><Text style={[s.miniBtnT,{color:theme.text}]}>清除</Text></TouchableOpacity></View></View>
        </ScrollView>
        <View style={[s.tabBar,{backgroundColor:theme.tab, borderColor:theme.border}]}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>財位</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('bazi');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={[s.tabOnT,{color:theme.gold}]}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  if(tab==='bazi'){
    return (
      <View style={[s.container,{backgroundColor:theme.bg}]}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:20,paddingBottom:160}}>
          <Text style={[s.bigTitle,{color:theme.gold}]}>八字參考</Text><Text style={[s.bigSub,{color:theme.sub}]}>今日財神{daily.caiDir} 吉時{daily.hour} 穿{daily.col}</Text>
          <View style={[s.card,{width:'92%', backgroundColor:theme.card, borderColor:theme.border}]}><TextInput style={[s.input,{backgroundColor:theme.inputBg, color:theme.text, borderColor:theme.border}]} placeholder="YYYY-MM-DD" placeholderTextColor="#888" value={baziInput} onChangeText={setBaziInput} /><TouchableOpacity style={[s.goldBtn,{marginTop:12}]} onPress={function(){ var r=calcBazi(baziInput); if(!r){ setBaziRes({error:"格式 YYYY-MM-DD"}); } else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); }}}><Text style={s.goldBtnText}>分析喜用</Text></TouchableOpacity>{baziRes && <View style={[s.unlockedBox,{backgroundColor:theme.inputBg}]}><Text style={[s.unlockedText,{color:theme.text}]}>{baziRes.error?baziRes.error: (baziRes.full+" 喜"+baziRes.xi+" 宜"+baziRes.dir+" 穿"+baziRes.col+" ★今日財神"+daily.caiDir+(baziRes.dir===daily.caiDir?" 超級財日 "+daily.hour+"必成":""))}</Text></View>}</View>
          <View style={[s.nativeBox,{backgroundColor:theme.card, borderColor:theme.border}]}>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={[s.tabBar,{backgroundColor:theme.tab, borderColor:theme.border}]}><TouchableOpacity style={s.tab} onPress={function(){setTab('compass');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('finance');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>財位</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={[s.tabOnT,{color:theme.gold}]}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={function(){setTab('settings');}}><Text style={[s.tabOff,{color:theme.tabOff}]}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }
  return (
    <View style={[s.container,{backgroundColor:theme.bg}]}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:170, paddingTop:0}}>
        <View style={[s.topBar,{backgroundColor:theme.topBar, borderColor:theme.border}]}>
          <View style={{flexDirection:'row', alignItems:'baseline'}}><Text style={[s.bigTitle,{color:theme.gold, fontSize:26}]}>{Math.round(smooth)}°</Text><Text style={[s.bigTitle,{color:theme.gold, fontSize:18, marginLeft:8}]}>風水佬Go</Text><Text style={[s.bigSub,{color:theme.sub, marginLeft:8}]}>{currentMountain.m}山 {currentDir}</Text></View>
          <View style={{flexDirection:'row', marginTop:4}}><View style={[s.pill,{backgroundColor:theme.gold}]}><Text style={s.pillT}>財神 {daily.caiDir}</Text></View><View style={[s.pill,{backgroundColor:theme.inputBg, marginLeft:6, borderWidth:1, borderColor:theme.border}]}><Text style={[s.pillT,{color:theme.text}]}>喜神 {daily.xiDir}</Text></View><View style={[s.pill,{backgroundColor:theme.inputBg, marginLeft:6, borderWidth:1, borderColor:theme.border}]}><Text style={[s.pillT,{color:theme.text}]}>{daily.hour} {daily.hourName}</Text></View></View>
        </View>

        <View style={s.luoPanWrap}>
          <View style={[s.luoPanOuter,{borderColor:theme.gold, backgroundColor:theme.compassOuter, shadowColor:theme.gold}]}>
            <View style={[s.luoPan, {transform:[{rotate:""+(-smooth)+"deg"}], borderColor:theme.border, backgroundColor:theme.compassBg}]}>
              <View style={[s.luoInner,{borderColor:theme.border2}]}>
                {MOUNTAINS_24.map(function(m,i){ var active=currentMountain && currentMountain.m===m; return (<View key={m} style={[s.mountainMark, {transform:[{rotate:""+(i*15)+"deg"}, {translateY:-106}]}]}><View style={{transform:[{rotate:""+(i*15+smooth)+"deg"}]}}><Text style={[s.mountainText, {color:active? '#000' : theme.compassText}, active && {backgroundColor:theme.gold, fontWeight:'bold', paddingHorizontal:5, borderRadius:7, fontSize:14}]}>{m}</Text></View></View>); })}
              </View>
              <View style={s.tickLayer}>{Array.from({length:24}).map(function(_,i){ return (<View key={i} style={[s.tick, {transform:[{rotate:""+(i*15)+"deg"}, {translateY:-130}], backgroundColor:i%6===0?theme.gold:theme.border2, height:i%6===0?10:6}]} />); })}</View>
            </View>
          </View>
          <View style={s.fixedNeedleWrap}><View style={s.needleTri} /><View style={s.needleLine} /></View>
          <Animated.View style={[s.centerDot,{backgroundColor:theme.gold, borderColor:theme.bg, transform:[{scale:pulse}]}]}><Text style={{color:'#000',fontWeight:'bold',fontSize:17}}>{currentMountain.m}</Text></Animated.View>
        </View>

        <View style={[s.scoreCard,{backgroundColor:theme.card, borderColor:theme.gold}]}><View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}><View><Text style={[s.scoreCardT,{color:theme.text}]}>今日偏財指數</Text><Text style={[s.scoreCardSub,{color:theme.text2}]}>坐{currentMountain.m}山 • {currentMountain.wu}行 • {currentMountain.cai}</Text></View><Text style={s.scoreCardNum}>{daily.score}%</Text></View><View style={{flexDirection:'row', marginTop:10}}><View style={[s.infoPill,{backgroundColor:theme.inputBg}]}><Text style={[s.infoPillT,{color:theme.text}]}>穿 {daily.col}</Text></View><View style={[s.infoPill,{backgroundColor:theme.inputBg, marginLeft:6}]}><Text style={[s.infoPillT,{color:theme.text}]}>幸運 {daily.num}</Text></View><View style={[s.infoPill,{backgroundColor:theme.inputBg, marginLeft:6}]}><Text style={[s.infoPillT,{color:theme.text}]}>{currentDir} {fly.star}</Text></View></View></View>

       
