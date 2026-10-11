import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Share, Vibration } from 'react-native';
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
  {m:"壬",gua:"坎",wu:"水",deg:"337.5-352.5",cai:"偏財"}, {m:"子",gua:"坎",wu:"水",deg:"352.5-7.5",cai:"帝旺財"},
  {m:"癸",gua:"坎",wu:"水",deg:"7.5-22.5",cai:"橫財"}, {m:"丑",gua:"艮",wu:"土",deg:"22.5-37.5",cai:"金庫"},
  {m:"艮",gua:"艮",wu:"土",deg:"37.5-52.5",cai:"地產"}, {m:"寅",gua:"艮",wu:"木",deg:"52.5-67.5",cai:"創業"},
  {m:"甲",gua:"震",wu:"木",deg:"67.5-82.5",cai:"正財"}, {m:"卯",gua:"震",wu:"木",deg:"82.5-97.5",cai:"旺財"},
  {m:"乙",gua:"震",wu:"木",deg:"97.5-112.5",cai:"小財"}, {m:"辰",gua:"巽",wu:"土",deg:"112.5-127.5",cai:"財庫"},
  {m:"巽",gua:"巽",wu:"木",deg:"127.5-142.5",cai:"文昌財"}, {m:"巳",gua:"巽",wu:"火",deg:"142.5-157.5",cai:"快財"},
  {m:"丙",gua:"離",wu:"火",deg:"157.5-172.5",cai:"名氣財"}, {m:"午",gua:"離",wu:"火",deg:"172.5-187.5",cai:"正財旺"},
  {m:"丁",gua:"離",wu:"火",deg:"187.5-202.5",cai:"暗財"}, {m:"未",gua:"坤",wu:"土",deg:"202.5-217.5",cai:"田宅"},
  {m:"坤",gua:"坤",wu:"土",deg:"217.5-232.5",cai:"財庫位"}, {m:"申",gua:"坤",wu:"金",deg:"232.5-247.5",cai:"貴人財"},
  {m:"庚",gua:"兌",wu:"金",deg:"247.5-262.5",cai:"武財"}, {m:"酉",gua:"兌",wu:"金",deg:"262.5-277.5",cai:"兌現"},
  {m:"辛",gua:"兌",wu:"金",deg:"277.5-292.5",cai:"珠寶財"}, {m:"戌",gua:"乾",wu:"土",deg:"292.5-307.5",cai:"大庫"},
  {m:"乾",gua:"乾",wu:"金",deg:"307.5-322.5",cai:"天財"}, {m:"亥",gua:"乾",wu:"水",deg:"322.5-337.5",cai:"長線財"},
];

const FLY_2026 = {
  "正北": {star:"一白貪狼", name:"偏財位", cai:95, color:"#D4AF37", good:true, desc:"2026一白入正北，最大偏財位，利投資、副業", lay:"正北放一杯清水 + 6枚硬幣，養一條黑色魚。錢包向北放，催偏財。忌紅色。", kou:"水為財，北為庫"},
  "東北": {star:"八白左輔", name:"正財帝位", cai:99, color:"#FFD700", good:true, desc:"2026八白最旺，正財帝王位，事業正財", lay:"東北放黃水晶聚寶盆 + 五帝錢，保險箱放此位，開門見財。最旺。", kou:"東北開，黃金來"},
  "正東": {star:"三碧祿存", name:"是非破財", cai:20, color:"#FF6B6B", good:false, desc:"三碧是非位，易有合約、口舌破財", lay:"放紅地氈 + 紅色枱燈，文件用紅色文件夾化解。忌魚缸、綠色。", kou:"東邊紅，是非空"},
  "東南": {star:"四綠文曲", name:"文昌財位", cai:82, color:"#51CF66", good:true, desc:"四綠文昌，利考試、寫作、流量變現", lay:"四枝富貴竹 + 文昌塔放東南，直播、寫嘢向東南，流量即財。", kou:"東南筆，寫出銀"},
  "正南": {star:"九紫右弼", name:"喜慶財位", cai:90, color:"#FF69B4", good:true, desc:"九紫喜慶，人緣財、喜事財", lay:"9枝紅花 + 紅燈放正南，做喜慶、直播帶貨，人緣即財。", kou:"南邊喜，錢自來"},
  "西南": {star:"二黑巨門", name:"病符位", cai:15, color:"#888", good:false, desc:"二黑病符，注意健康導致破財", lay:"銅葫蘆 + 五帝錢，保持整潔，唔放雜物，唔訓此位。", kou:"西南淨，保住錢"},
  "正西": {star:"七赤破軍", name:"破財位", cai:25, color:"#FF8E53", good:false, desc:"七赤破軍，易被盜、被騙", lay:"一杯清水 + 藍色地氈，唔放刀、剪，錢包唔放正西。", kou:"西邊水，擋小人"},
  "西北": {star:"六白武曲", name:"貴人財位", cai:88, color:"#D4AF37", good:true, desc:"六白武曲，貴人帶財，利事業", lay:"金屬風鈴 + 六帝錢放西北，男主人向西北坐，傾生意易成。", kou:"西北金，貴人臨"},
  "中宮": {star:"五黃", name:"五黃煞", cai:5, color:"#FF4444", good:false, desc:"2026中宮五黃，宜靜不宜動", lay:"五帝錢 + 銅鐘，保持乾淨，唔動土、唔放紅色。", kou:"中宮靜，避大破"},
};

function calcBazi(dateStr){
  try{
    const d=new Date(dateStr); if(isNaN(d)) return null;
    const stems=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const y=d.getFullYear(); const m=d.getMonth()+1; const day=d.getDate();
    const yearStem=stems[(y-4)%10]; const dayStem=stems[(day*2+m)%10];
    const map={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
    const five={木:1,火:1,土:1,金:1,水:1}; five[map[yearStem]]++; five[map[dayStem]]++;
    const weak=Object.entries(five).sort((a,b)=>a[1]-b[1])[0][0];
    const lucky={木:{el:"火",dir:"正南",col:"紅紫色",num:"2,7",w:"南邊發財燈"},火:{el:"土",dir:"西南",col:"黃色",num:"5,0",w:"黃水晶"},土:{el:"金",dir:"正西",col:"白金色",num:"4,9",w:"保險箱放西"},金:{el:"水",dir:"正北",col:"黑藍色",num:"1,6",w:"北邊放水"},水:{el:"木",dir:"正東",col:"綠色",num:"3,8",w:"東邊發財樹"}};
    return {y, full:`${y}年 ${yearStem}命 日主${dayStem}`, five, xi:weak,...lucky[weak]};
  }catch{ return null; }
}

export default function App(){
  const [tab,setTab]=useState('compass');
  const [heading,setHeading]=useState(0); const [smooth,setSmooth]=useState(0);
  const [adsReady,setAdsReady]=useState(false); const [interReady,setInterReady]=useState(false);
  const [baziInput,setBaziInput]=useState(''); const [baziRes,setBaziRes]=useState(null);
  const [unlockedCai,setUnlockedCai]=useState(false); const [needCalib,setNeedCalib]=useState(false);
  const [lastInter,setLastInter]=useState(0);
  const interRef=useRef(null); const lastRaw=useRef(0);
  const acc=useRef({x:0,y:0,z:9.81}); const magF=useRef({x:0,y:0,z:0});

  // 核心修復 - 保證會轉
  useEffect(()=>{
    let mSub,aSub; let first=true;
    (async()=>{
      const ok=await Magnetometer.isAvailableAsync(); if(!ok){ setNeedCalib(true); return; }
      await Magnetometer.setUpdateIntervalAsync(60);
      await Accelerometer.setUpdateIntervalAsync(60);
      aSub=Accelerometer.addListener(d=>acc.current=d);
      mSub=Magnetometer.addListener(d=>{
        if(first){ magF.current=d; first=false; }
        else { magF.current.x=magF.current.x*0.75+d.x*0.25; magF.current.y=magF.current.y*0.75+d.y*0.25; magF.current.z=magF.current.z*0.75+d.z*0.25; }
        const {x,y,z}=magF.current; const {x:ax,y:ay,z:az}=acc.current;
        let a;
        if(Math.abs(az)>0.2){ // 有重力用補償
          const roll=Math.atan2(ay,az); const pitch=Math.atan2(-ax, Math.hypot(ay,az));
          const mx=x*Math.cos(pitch)+z*Math.sin(pitch);
          const my=x*Math.sin(roll)*Math.sin(pitch)+y*Math.cos(roll)-z*Math.sin(roll)*Math.cos(pitch);
          if(!isFinite(mx)||!isFinite(my)) return;
          a=Math.atan2(-my,mx)*180/Math.PI;
        } else { a=Math.atan2(y,x)*180/Math.PI; } // 平放保底，一定會轉
        a=(a+360)%360;
        const s=Math.hypot(x,y,z); setNeedCalib(s<12||s>90);
        let diff=a-lastRaw.current; if(diff>180) diff-=360; if(diff<-180) diff+=360;
        lastRaw.current=(lastRaw.current+diff*0.38+360)%360;
        setHeading(lastRaw.current);
      });
      const sv=await AsyncStorage.getItem('bazi_v1'); if(sv) setBaziInput(sv);
    })();
    return()=>{mSub?.remove(); aSub?.remove();};
  },[]);

  useEffect(()=>{ const t=setInterval(()=>{ let d=heading-smooth; if(d>180)d-=360; if(d<-180)d+=360; if(Math.abs(d)>0.01) setSmooth(v=>(v+d*0.2+360)%360); },16); return()=>clearInterval(t); },[heading,smooth]);

  useEffect(()=>{ setTimeout(async()=>{ try{ await mobileAds().initialize(); setAdsReady(true); const inter=InterstitialAd.createForAdRequest(IDS.inter,{requestNonPersonalizedAdsOnly:true}); interRef.current=inter; inter.load(); inter.addAdEventListener(AdEventType.LOADED,()=>setInterReady(true)); inter.addAdEventListener(AdEventType.CLOSED,()=>{ setLastInter(Date.now()); inter.load(); }); AppOpenAd.createForAdRequest(IDS.appopen,{requestNonPersonalizedAdsOnly:true}).load(); }catch{} },800); },[]);

  const currentMountain=useMemo(()=>{ const i=Math.floor((smooth+7.5)/15)%24; return MOUNTAINS_INFO[i]; },[smooth]);
  const dirs=["正北","東北","正東","東南","正南","西南","正西","西北"]; const currentDir=dirs[Math.round(smooth/45)%8]; const fly=FLY_2026[currentDir]||FLY_2026["正北"];

  const showInter=(cb)=>{
    Alert.alert("提示","查看詳細佈局將播放廣告，可跳過",[
      {text:"取消", style:"cancel"},
      {text:"繼續查看", onPress:()=>{
        const now=Date.now();
        if(interReady&&now-lastInter>25000&&interRef.current){
          const u=interRef.current.addAdEventListener(AdEventType.CLOSED,()=>{ cb(); u(); });
          interRef.current.show().catch(()=>cb());
        } else cb();
      }}
    ]);
  };

  if(tab==='settings'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{padding:16,paddingTop:45,paddingBottom:130}}>
          <Text style={s.title}>設定</Text><Text style={s.sub}>風水佬Go • {Math.round(smooth)}° 實時 • v1.0</Text>
          <View style={s.setCard}><Text style={s.setT}>羅盤狀態 {needCalib?'⚠️需校準':'✓ '+Math.round(smooth)+'° 正常'}</Text>
            <Text style={s.setD}>當前 {currentMountain.m}山 {currentMountain.gua}卦 {currentMountain.wu}行 • {currentMountain.cai}{'\n'}度數：{currentMountain.deg}°{'\n'}已修復0°問題，會跟手轉。平放畫8字校準。</Text>
            <TouchableOpacity style={s.goldBtn} onPress={()=>Alert.alert('校準教學','1.平放手機\n2.空中畫8字5次\n3.遠離磁鐵、喇叭\n4.直到度數跟住轉')}><Text style={s.goldBtnText}>校準教學</Text></TouchableOpacity>
          </View>
          <View style={s.setCard}><Text style={s.setT}>八字資料</Text><Text style={s.setD}>已儲存：{baziInput||'未設定'}</Text>
            <View style={{flexDirection:'row', gap:8, marginTop:8}}>
              <TouchableOpacity style={[s.darkBtn,{flex:1}]} onPress={async()=>{ if(baziInput){ await AsyncStorage.setItem('bazi_v1',baziInput); Alert.alert('已儲存'); } }}><Text style={s.darkBtnText}>儲存生日</Text></TouchableOpacity>
              <TouchableOpacity style={[s.darkBtn,{flex:1}]} onPress={async()=>{ await AsyncStorage.clear(); setBaziInput(''); setBaziRes(null); Alert.alert('已清除'); }}><Text style={s.darkBtnText}>清除資料</Text></TouchableOpacity>
            </View>
          </View>
          <View style={s.setCard}><Text style={s.setT}>關於與免責</Text><Text style={s.setD}>風水佬Go v1.0 (1) • API36{'\n'}套件 com.laptimego.fungsui{'\n'}內容僅供參考娛樂，重要決定請諮詢專業人士。羅盤需遠離磁場干擾。</Text>
            <TouchableOpacity style={s.darkBtn} onPress={()=>{ Vibration.vibrate(30); Share.share({message:'風水佬Go - 專業電子羅盤，24山 + 2026九宮飛星'}); }}><Text style={s.darkBtnText}>分享App</Text></TouchableOpacity>
          </View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }

  if(tab==='bazi'){
    return (
      <View style={s.container}>
        <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center',paddingTop:40,paddingBottom:130}}>
          <Text style={s.title}>八字財運參考</Text><Text style={s.sub}>輸入生日，查看喜用財位</Text>
          <View style={[s.card,{width:'92%'}]}>
            <Text style={s.label}>出生日期</Text>
            <View style={{flexDirection:'row', gap:8}}>
              <TextInput style={[s.input,{flex:1}]} placeholder="YYYY-MM-DD 例如 1990-05-20" placeholderTextColor="#666" value={baziInput} onChangeText={setBaziInput} />
              <TouchableOpacity style={[s.goldBtn,{marginTop:0, paddingHorizontal:18}]} onPress={()=>{ const r=calcBazi(baziInput); if(!r) setBaziRes({error:"格式錯，請用 YYYY-MM-DD"}); else { setBaziRes(r); AsyncStorage.setItem('bazi_v1',baziInput); } }}><Text style={s.goldBtnText}>分析</Text></TouchableOpacity>
            </View>
            {baziRes && (
              <View style={s.unlockedBox}>
                {baziRes.error? <Text style={s.unlockedText}>{baziRes.error}</Text> :
                <>
                  <Text style={s.unlockedTitle}>{baziRes.full}</Text>
                  <Text style={s.unlockedText}>五行分佈：木{baziRes.five.木} 火{baziRes.five.火} 土{baziRes.five.土} 金{baziRes.five.金} 水{baziRes.five.水}</Text>
                  <Text style={[s.unlockedText,{color:'#D4AF37', fontWeight:'bold', marginTop:8}]}>喜用神：{baziRes.xi}行 → 催財：{baziRes.el}</Text>
                  <Text style={s.unlockedText}>幸運方位：{baziRes.dir} 幸運色：{baziRes.col} 號碼：{baziRes.num}</Text>
                  <Text style={s.unlockedText}>佈局秘訣：{baziRes.w}</Text>
                  <Text style={s.unlockedText}>當前羅盤 {currentDir} {fly.name} 財力{fly.cai}% 與你喜用{ baziRes.dir.includes(currentDir)?'相合 ★':'可參考'}</Text>
                </>}
              </View>
            )}
          </View>
          <View style={s.nativeBox}><Text style={s.adLabel}>推薦內容</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        </ScrollView>
        <View style={s.tabBar}><TouchableOpacity style={s.tab} onPress={()=>setTab('compass')}><Text style={s.tabOff}>羅盤</Text></TouchableOpacity><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
        <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center', paddingBottom:140, paddingTop:35}}>
        <Text style={s.title}>風水佬Go {Math.round(smooth)}° {needCalib?'⚠️輕搖校準':''}</Text>
        <Text style={s.sub}>2026年 • {currentDir} {fly.star} 財力{fly.cai}% • {currentMountain.m}山 {currentMountain.gua} {currentMountain.cai}</Text>

        <View style={s.luoPanWrap}>
          <View style={[s.luoPan, {transform:[{rotate:`${-smooth}deg`}]}]}>
            <View style={s.luoInner}>
              <View style={s.ring2}>{MOUNTAINS_24.map((m,i)=>(<View key={'r2'+m} style={[s.mark2, {transform:[{rotate:`${i*15}deg`}, {translateY:-92}]}]}><Text style={s.mark2T}>{m}</Text></View>))}</View>
              {MOUNTAINS_24.map((m,i)=>(<View key={m} style={[s.mountainMark, {transform:[{rotate:`${i*15}deg`}, {translateY:-118}]}]}><Text style={[s.mountainText, currentMountain?.m===m && s.mountainActive]}>{m}</Text></View>))}
              <View style={s.centerDot}><Text style={{color:'#000',fontWeight:'900',fontSize:13}}>{currentMountain.m}</Text><Text style={{color:'#000',fontSize:9}}>{currentMountain.gua}</Text></View>
            </View>
            <Text style={s.northMark}>北 0° / {Math.round(smooth)}°</Text>
          </View>
          <View style={s.fixedNeedle}><View style={s.needleTri}/></View>
        </View>

        <View style={[s.card, {borderColor: fly.color, borderWidth:1.2}]}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={[s.cardTitle, {color:fly.color}]}>{currentDir} {fly.name}</Text>
            <View style={[s.badge,{backgroundColor:fly.color}]}><Text style={s.badgeT}>財力 {fly.cai}%</Text></View>
          </View>
          <Text style={s.cardSub}>{fly.star} • {currentMountain.deg}° 坐{currentMountain.m}山 • {currentMountain.wu}行 {currentMountain.cai}</Text>
          <Text style={s.cardDesc}>{fly.desc}</Text>
          <Text style={s.kou}>口訣：{fly.kou}</Text>
          {!unlockedCai? (
            <TouchableOpacity style={s.goldBtn} onPress={()=>showInter(()=>setUnlockedCai(true))}><Text style={s.goldBtnText}>查看詳細佈局 (將播放廣告)</Text></TouchableOpacity>
          ) : (
            <View style={s.unlockedBox}>
              <Text style={s.unlockedTitle}>印鈔佈局詳解</Text>
              <Text style={s.unlockedText}>{fly.lay}</Text>
              <Text style={[s.unlockedText,{marginTop:8, color:'#D4AF37'}]}>坐{currentMountain.m}山 {currentMountain.gua}卦 {currentMountain.wu}行，利{currentMountain.cai}。配合{currentDir} {fly.star}，{fly.good?'宜動宜催財':'宜靜宜化解'}。</Text>
              <View style={{flexDirection:'row', marginTop:10, gap:8}}>
                <TouchableOpacity style={s.smallBtn} onPress={()=>Share.share({message:`${currentDir}${fly.name} ${currentMountain.m}山 ${fly.lay} - 風水佬Go`})}><Text style={s.smallBtnT}>分享佈局</Text></TouchableOpacity>
                <TouchableOpacity style={s.smallBtn} onPress={()=>setUnlockedCai(false)}><Text style={s.smallBtnT}>收起</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={s.nativeBox}><Text style={s.adLabel}>推薦內容</Text>{adsReady && <BannerAd unitId={IDS.native} size={BannerAdSize.MEDIUM_RECTANGLE} />}</View>
        <Text style={{color:'#2a2a2a',fontSize:9,marginTop:12}}>羅盤已修復 • 平放畫8字校準 • 僅供參考</Text>
      </ScrollView>
      <View style={s.tabBar}><TouchableOpacity style={[s.tab,s.tabOn]}><Text style={s.tabOnT}>羅盤</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('bazi')}><Text style={s.tabOff}>八字</Text></TouchableOpacity><TouchableOpacity style={s.tab} onPress={()=>setTab('settings')}><Text style={s.tabOff}>設定</Text></TouchableOpacity></View>
      <View style={s.bottomAd}>{adsReady && <BannerAd unitId={IDS.banner} size={BannerAdSize.BANNER} />}</View>
    </View>
  );
}

const s=StyleSheet.create({
  container:{flex:1, backgroundColor:'#0f0f0f', alignItems:'center'},
  title:{color:'#D4AF37', fontSize:21, fontWeight:'900'}, sub:{color:'#888', fontSize:11, marginTop:3},
  luoPanWrap:{width:310,height:310, alignItems:'center', justifyContent:'center', marginTop:16},
  luoPan:{width:290,height:290, borderRadius:145, borderWidth:3, borderColor:'#D4AF37', backgroundColor:'#1a1a1a', alignItems:'center', justifyContent:'center', shadowColor:'#D4AF37', shadowOpacity:0.15, shadowRadius:10},
  luoInner:{width:230,height:230, borderRadius:115, borderWidth:1, borderColor:'#333', alignItems:'center', justifyContent:'center', backgroundColor:'#121212'},
  ring2:{width:184,height:184, borderRadius:92, borderWidth:1, borderColor:'#222', position:'absolute', alignItems:'center', justifyContent:'center'},
  mark2:{position:'absolute', top:'50%', left:'50%', width:14, marginLeft:-7, marginTop:-7, alignItems:'center'}, mark2T:{color:'#444', fontSize:8},
  mountainMark:{position:'absolute', top:'50%', left:'50%', width:22, marginLeft:-11, marginTop:-11, alignItems:'center'},
  mountainText:{color:'#888', fontSize:11}, mountainActive:{color:'#000', fontWeight:'900', fontSize:13, backgroundColor:'#D4AF37', borderRadius:5, paddingHorizontal:4, paddingVertical:1},
  centerDot:{width:50,height:50,borderRadius:25,backgroundColor:'#D4AF37',alignItems:'center',justifyContent:'center', borderWidth:2, borderColor:'#fff'},
  northMark:{position:'absolute', top:-22, color:'#fff', fontSize:10, backgroundColor:'#000', paddingHorizontal:6, borderRadius:4}, fixedNeedle:{position:'absolute', top:-2, alignItems:'center'}, needleTri:{width:0,height:0,borderLeftWidth:7,borderRightWidth:7,borderBottomWidth:12,borderStyle:'solid',borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:'#ff2222'},
  card:{width:'92%', backgroundColor:'#1e1e1e', borderRadius:14, padding:14, marginTop:14, borderWidth:1, borderColor:'#333'},
  cardTitle:{fontSize:16, fontWeight:'900'}, cardSub:{color:'#777', fontSize:10, marginTop:2}, cardDesc:{color:'#ccc', fontSize:12, marginTop:6, lineHeight:17}, kou:{color:'#D4AF37', fontSize:11, marginTop:6, fontStyle:'italic'},
  badge:{paddingHorizontal:8, paddingVertical:2, borderRadius:8}, badgeT:{color:'#000', fontSize:10, fontWeight:'900'},
  goldBtn:{backgroundColor:'#D4AF37', padding:13, borderRadius:11, marginTop:12, alignItems:'center'}, goldBtnText:{color:'#000', fontWeight:'900', fontSize:13},
  smallBtn:{backgroundColor:'#222', borderWidth:1, borderColor:'#D4AF37', paddingVertical:8, paddingHorizontal:12, borderRadius:8}, smallBtnT:{color:'#D4AF37', fontSize:11, fontWeight:'700'},
  unlockedBox:{backgroundColor:'#262626', padding:11, borderRadius:10, marginTop:10, borderWidth:1, borderColor:'#333'}, unlockedTitle:{color:'#D4AF37', fontWeight:'900', fontSize:13}, unlockedText:{color:'#ddd', fontSize:12, marginTop:4, lineHeight:18},
  nativeBox:{width:'92%', backgroundColor:'#151515', borderRadius:12, padding:8, marginTop:14, alignItems:'center', minHeight:268, borderWidth:1, borderColor:'#333'},
  adLabel:{color:'#555', fontSize:9, marginBottom:4}, input:{backgroundColor:'#222', color:'#fff', padding:12, borderRadius:10, borderWidth:1, borderColor:'#333'},
  label:{color:'#888',
