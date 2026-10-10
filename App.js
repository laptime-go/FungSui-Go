import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

// 你4個正式ID
const IDS = {
  banner: "ca-app-pub-9890149028563226/7565306387",
  inter: "ca-app-pub-9890149028563226/5859110495",
  appopen: "ca-app-pub-9890149028563226/1285440667",
  native: "ca-app-pub-9890149028563226/9108090368"
};

// 24山
const MOUNTAINS_24 = ["壬","子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥"];
const MOUNTAINS_INFO = [
  {m:"壬",gua:"坎",el:"水",deg:"337.5-352.5"}, {m:"子",gua:"坎",el:"水",deg:"352.5-7.5"}, {m:"癸",gua:"坎",el:"水",deg:"7.5-22.5"},
  {m:"丑",gua:"艮",el:"土",deg:"22.5-37.5"}, {m:"艮",gua:"艮",el:"土",deg:"37.5-52.5"}, {m:"寅",gua:"艮",el:"木",deg:"52.5-67.5"},
  {m:"甲",gua:"震",el:"木",deg:"67.5-82.5"}, {m:"卯",gua:"震",el:"木",deg:"82.5-97.5"}, {m:"乙",gua:"震",el:"木",deg:"97.5-112.5"},
  {m:"辰",gua:"巽",el:"土",deg:"112.5-127.5"}, {m:"巽",gua:"巽",el:"木",deg:"127.5-142.5"}, {m:"巳",gua:"巽",el:"火",deg:"142.5-157.5"},
  {m:"丙",gua:"離",el:"火",deg:"157.5-172.5"}, {m:"午",gua:"離",el:"火",deg:"172.5-187.5"}, {m:"丁",gua:"離",el:"火",deg:"187.5-202.5"},
  {m:"未",gua:"坤",el:"土",deg:"202.5-217.5"}, {m:"坤",gua:"坤",el:"土",deg:"217.5-232.5"}, {m:"申",gua:"坤",el:"金",deg:"232.5-247.5"},
  {m:"庚",gua:"兌",el:"金",deg:"247.5-262.5"}, {m:"酉",gua:"兌",el:"金",deg:"262.5-277.5"}, {m:"辛",gua:"兌",el:"金",deg:"277.5-292.5"},
  {m:"戌",gua:"乾",el:"土",deg:"292.5-307.5"}, {m:"乾",gua:"乾",el:"金",deg:"307.5-322.5"}, {m:"亥",gua:"乾",el:"水",deg:"322.5-337.5"},
];

// 2026 丙午年 流年飛星 - 中宮一白
const FLY_2026 = {
  "正北": {star:"一白", name:"偏財位", desc:"2026大財星，利正財偏財，放水種植物", color:"#FFD700", good:true},
  "西南": {star:"二黑", name:"病符位", desc:"病氣重，放銅葫蘆化煞", color:"#666", good:false},
  "正東": {star:"三碧", name:"是非位", desc:"小人是非多，放紅色物品", color:"#FF4444", good:false},
  "東南": {star:"四綠", name:"文昌正財位", desc:"文昌考試，利讀書，放文昌塔", color:"#44FF44", good:true},
  "中宮": {star:"五黃", name:"大煞位", desc:"2026中宮要小心，唔好動土", color:"#FF0000", good:false},
  "西北": {star:"六白", name:"武曲偏財位", desc:"武職、偏財，放銅錢", color:"#FFD700", good:true},
  "正西": {star:"七赤", name:"破財位", desc:"破財、口舌，放水化", color:"#FF8888", good:false},
  "東北": {star:"八白", name:"大財位", desc:"2026八白正財，最大財位，放財箱", color:"#FFD700", good:true},
  "正南": {star:"九紫", name:"喜慶位", desc:"喜事、姻緣，放紅色地氈", color:"#FF69B4", good:true},
};

// 簡易萬年曆算八字喜用
function calcBazi(dateStr){
  try{
    const d = new Date(dateStr);
    if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const branches=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    const y = d.getFullYear();
    const m = d.getMonth()+1;
    const day = d.getDate();
    // 簡化：用年份計日主
    const yearStem = stems[(y-4)%10];
    const monthBranch = branches[(m+1)%12];
    const dayStem = stems[(y*5 + m*3 + day)%10];

    const fiveCount = {木:0,火:0,土:0,金:0,水:0};
    const map = {甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    [yearStem, dayStem].forEach(s=>{ if(map[s]) fiveCount[map[s]]++; });

    let weak = Object.entries(fiveCount).sort((a,b)=>a[1]-b[1])[0][0];
    let luckyMap = {木:"火🔥 正南、紅色",火:"土🟤 西南、黃色",土:"金⚪ 正西、白色",金:"水💧 正北、黑色",水:"木🌿 正東、綠色"};

    return {yearStem, dayStem, monthBranch, fiveCount, xi: weak, luckyDir: luckyMap[weak], full: `${y}年 ${yearStem}日主 - 日干${dayStem}`};
  }catch(e){ return null; }
}

export default function App(){
  const [heading,setHeading]=useState(0);
  const [adsReady,setAdsReady]=useState(false);
  const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState('');
  const [baziRes,setBaziRes]=useState(null);
  const [unlockedBazi,setUnlockedBazi]=useState(false);
  const [unlockedCai,setUnlockedCai]=useState(false);

  const interRef=useRef(null);
  const appOpenRef=useRef(null);
  const lastHeading=useRef(0);
  const magSub=useRef(null);

  // 羅盤
  useEffect(()=>{
    let isMounted=true;
    (async()=>{
      const available = await Magnetometer.isAvailableAsync();
      if(!available) return;
      await Magnetometer.setUpdateIntervalAsync(200);
      magSub.current = Magnetometer.addListener(({x,y})=>{
        if(!isMounted) return;
        let angle = Math.atan2(y,x)*180/Math.PI;
        angle = 90 - angle;
        if(angle<0) angle+=360;
        if(Math.abs(angle - lastHeading.current) > 1.5){
          lastHeading.current = angle;
          setHeading(angle);
        }
      });
    })();
    return()=>{ isMounted=false; magSub.current?.remove(); };
  },[]);

  // 廣告初始化 - 延遲2秒防閃退，同LapTime一樣
  useEffect(()=>{
    const t=setTimeout(async()=>{
      try{
        await mobileAds().initialize();
        setAdsReady(true);
        // 插屏
        const inter = InterstitialAd.createForAdRequest(IDS.inter, { requestNonPersonalizedAdsOnly: true });
        interRef.current=inter;
        inter.load();
        inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true));
        inter.addAdEventListener(AdEventType.CLOSED,()=>{
          setInterReady(false);
          inter.load();
        });
        // AppOpen
        const appOpen = AppOpenAd.createForAdRequest(IDS.appopen, { requestNonPersonalizedAdsOnly: true });
        appOpenRef.current=appOpen;
        appOpen.load();
      }catch(e){ console.log("ads init fail",e); }
    },2000);
    return()=>clearTimeout(t);
  },[]);

  const currentMountain = useMemo(()=>{
    const idx = Math.floor((heading+7.5)/15)%24;
    return MOUNTAINS_INFO[idx];
  },[heading]);

  const currentDir = useMemo(()=>{
    const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"];
    return dirs[Math.round(heading/45)%8];
  },[heading]);

  const fly = FLY_2026[currentDir];

  const handleBaziCalc = ()=>{
    const res = calcBazi(baziInput);
    if(!res){ setBaziRes({error:"格式錯，請打 YYYY-MM-DD 例如 1990-05-20"}); return; }
    setBaziRes(res);
    if(!unlockedBazi){
      if(interRef.current && interReady){
        interRef.current.show().then(()=>setUnlockedBazi(true)).catch(()=>setUnlockedBazi(true));
      } else {
        setUnlockedBazi(true);
      }
    }
  };

  const handleUnlockCai = ()=>{
    if(unlockedCai) return;
    if(interRef.current && interReady){
      const unsub = interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{
        setUnlockedCai(true);
        unsub();
      });
      interRef.current.show();
    } else {
      setUnlockedCai(true);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:160, paddingTop:40}}>
        <Text style={s.title}>風水佬Go {Math.round(heading)}° {adsReady?'✓':''}</Text>
        <Text style={s.sub}>2026丙午年 中宮一白 • {currentMountain?.m}山 {currentMountain?.gua}卦</Text>

        {/* 天池羅盤 */}
        <View style={s.luoPanWrap}>
          <View style={[s.luoPan, {transform:[{rotate:`${-heading}deg`}]}]}>
            <View style={s.luoInner}>
              {MOUNTAINS_24.map((m,i)=>{
                const ang = i*15;
                return (
                  <View key={m} style={[s.mountainMark, {transform:[{rotate:`${ang}deg`}, {translateY:-110}]}]}>
                    <Text style={[s.mountainText, currentMountain?.m===m && s.mountainActive]}>{m}</Text>
                  </View>
                );
              })}
              <View style={s.centerDot}><Text style={{color:'#000',fontWeight:'bold',fontSize:10}}>{currentMountain?.m}</Text></View>
            </View>
            <Text style={s.northMark}>北 ▲ {Math.round(heading)}°</Text>
          </View>
          <View style={s.fixedNeedle}><Text style={{color:'red',fontSize:20}}>▼</Text></View>
        </View>

        {/* 飛星卡 */}
        <View style={[s.card, {borderColor: fly.color}]}>
          <Text style={[s.cardTitle, {color:fly.color}]}>{currentDir} - {fly.star} {fly.name} {fly.good?'💰':'⚠️'}</Text>
          <Text style={s.cardDesc}>{fly.desc}</Text>
          <Text style={s.mountainDetail}>坐{currentMountain?.m}山 屬{currentMountain?.el} 卦{currentMountain?.gua} {currentMountain?.deg}°</Text>
          {!unlockedCai? (
            <TouchableOpacity style={s.goldBtn} onPress={handleUnlockCai}>
              <Text style={s.goldBtnText}>💰 解鎖催財佈局 {interReady?'[廣告就緒]':''}</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.unlockedBox}>
              <Text style={s.unlockedText}>✅ 已解鎖佈局：</Text>
              <Text style={s.unlockedText}>{fly.good? `在此方位放財箱/水種富貴竹，2026大利` : `此方位放${fly.star==='二黑'?'銅葫蘆':'紅色地氈'}化煞，唔好放垃圾桶`}</Text>
              <Text style={s.unlockedText}>坐向：{currentMountain?.m}山 宜用 {currentMountain?.el==='水'?'黑色藍色': currentMountain?.el==='火'?'紅色': currentMountain?.el==='木'?'綠色':'黃白'}系</Text>
            </View>
          )}
        </View>

        {/* 原生廣告 */}
        <View style={s.nativeBox}>
          <Text style={s.adLabel}>風水開運推薦</Text>
          {adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}
        </View>

        {/* 八字 */}
        <View style={s.card}>
          <Text style={s.cardTitle}>八字喜用神</Text>
          <TextInput style={s.input} placeholder="輸入生日 YYYY-MM-DD" placeholderTextColor="#666" value={baziInput} onChangeText={(t)=>{setBaziInput(t); setUnlockedBazi(false); setBaziRes(null);}} />
          <TouchableOpacity style={s.darkBtn} onPress={handleBaziCalc}>
            <Text style={s.darkBtnText}>🔓 計算喜用神 {interReady &&!unlockedBazi?'[睇廣告解鎖]':''}</Text>
          </TouchableOpacity>
          {baziRes && (
            <View style={s.unlockedBox}>
              {baziRes.error? <Text style={{color:'red'}}>{baziRes.error}</Text> : (
                <>
                  <Text style={s.unlockedText}>{baziRes.full}</Text>
                  <Text style={s.unlockedText}>五行：{Object.entries(baziRes.fiveCount).map(([k,v])=>`${k}${v}`).join(' ')}</Text>
                  <Text style={[s.unlockedText,{color:'#FFD700',fontWeight:'bold'}]}>喜用：{baziRes.xi} - 宜 {baziRes.luckyDir}</Text>
                  {unlockedBazi && <Text style={s.unlockedText}>→ 2026丙午年火旺，喜{baziRes.xi}者坐 {baziRes.luckyDir} 最旺財</Text>}
                </>
              )}
            </View>
          )}
        </View>

        <Text style={{color:'#444',fontSize:10,marginTop:20}}>v24 API36 • SDK51.0.28 • sensors 13.0.9 • {adsReady?'廣告已就緒':''}</Text>
      </ScrollView>

      {/* 底部 Banner */}
      <View style={s.bottomAd}>
        {adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />}
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0f0f0f', alignItems:'center'},
  title:{color:'#d4af37', fontSize:22, fontWeight:'bold'},
  sub:{color:'#888', fontSize:12, marginTop:4},
  luoPanWrap:{width:300,height:300, alignItems:'center', justifyContent:'center', marginTop:20},
  luoPan:{width:280,height:280, borderRadius:140, borderWidth:3, borderColor:'#d4af37', backgroundColor:'#1a1a1a', alignItems:'center', justifyContent:'center'},
  luoInner:{width:220,height:220, borderRadius:110, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center'},
  mountainMark:{position:'absolute', top:'50%', left:'50%', width:20, marginLeft:-10, marginTop:-10, alignItems:'center'},
  mountainText:{color:'#888', fontSize:11},
  mountainActive:{color:'#d4af37', fontWeight:'bold', fontSize:13, backgroundColor:'#333', borderRadius:4, paddingHorizontal:2},
  centerDot:{width:40,height:40,borderRadius:20,backgroundColor:'#d4af37',alignItems:'center',justifyContent:'center'},
  northMark:{position:'absolute', top:-25, color:'#fff', fontSize:12},
  fixedNeedle:{position:'absolute', top:0},
  card:{width:'92%', backgroundColor:'#1e1e1e', borderRadius:12, padding:14, marginTop:16, borderWidth:1, borderColor:'#333'},
  cardTitle:{color:'#d4af37', fontSize:16, fontWeight:'bold'},
  cardDesc:{color:'#ccc', fontSize:13, marginTop:6},
  mountainDetail:{color:'#888', fontSize:11, marginTop:6},
  goldBtn:{backgroundColor:'#d4af37', padding:12, borderRadius:10, marginTop:12, alignItems:'center'},
  goldBtnText:{color:'#000', fontWeight:'bold'},
  darkBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#d4af37', padding:12, borderRadius:10, marginTop:10, alignItems:'center'},
  darkBtnText:{color:'#d4af37', fontWeight:'bold'},
  unlockedBox:{backgroundColor:'#2a2a2a', padding:10, borderRadius:8, marginTop:10},
  unlockedText:{color:'#ddd', fontSize:13, marginTop:4, lineHeight:18},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:12, padding:8, marginTop:16, alignItems:'center', minHeight:270, borderWidth:1, borderColor:'#333'},
  adLabel:{color:'#666', fontSize:10, marginBottom:4},
  input:{backgroundColor:'#222', color:'#fff', padding:12, borderRadius:8, borderWidth:1, borderColor:'#333', marginTop:10},
  bottomAd:{position:'absolute', bottom:0, width:'100%', alignItems:'center', backgroundColor:'#000', paddingBottom:4, paddingTop:2}
});
