# VRM 아바타 — 모델별 출처·이용 조건

VRoid Studio 알파판 샘플 모델. VRoid(pixiv)가 CC0으로 공개한 모델을 OpenGameArt에서 받았다(2026-11-02).

- 출처: https://opengameart.org/content/vroid-studio-cc0-models
- 원 안내: https://vroid.pixiv.help/hc/en-us/articles/4402614652569-Do-VRoid-Studio-s-sample-models-come-with-conditions-of-use

| 파일 | 원래 이름 |
|---|---|
| vroid-d.vrm | AvatarSample_D |
| vroid-e.vrm | AvatarSample_E |
| vroid-f.vrm | AvatarSample_F |
| vroid-g.vrm | AvatarSample_G |
| vroid-shino.vrm | Sendagaya Shino |

위 CC0 묶음에는 AvatarSample A~C를 넣지 않았다. 이후 등록된 AvatarSample_C와 그 얼굴을 쓴 남성 레인저·주민은 아래의 별도 VRoid 샘플 조건을 유지한다.

## 2026-11-04 추가: 무료 판타지 캐릭터 6종

Mixamo는 Adobe 로그인이 필요해 이번에는 파일을 받지 않았다. 공식 제작자의 무료 공개 파일을 받아 기존 매트릭스의 셀 명암·휴머노이드 동작·실제 얼굴 표정을 적용했다. 원작 권리를 자체 제작물로 바꾸어 표시하지 않는다.

| 파일 | 구성·변환 | 이용 조건 |
|---|---|---|
| matrix-paladin.vrm | crownjoshua 기사 + VRoid CC0 기본 남성 얼굴, 은금 갑옷 | CC0 |
| matrix-knight.vrm | 같은 기사 원본의 청록 갑옷 변형 | CC0 |
| matrix-ranger-male.vrm | Quaternius 남성 Ranger + VRoid AvatarSample_C 얼굴·머리 | 의상 CC0 + VRoid 샘플 조건 |
| matrix-ranger-female.vrm | Quaternius 여성 Ranger + VRoid CC0 E 얼굴·머리 | CC0 |
| matrix-peasant-male.vrm | Quaternius 남성 Peasant + VRoid AvatarSample_C 얼굴·머리 | 의상 CC0 + VRoid 샘플 조건 |
| matrix-peasant-female.vrm | Quaternius 여성 Peasant + VRoid CC0 E 얼굴·머리 | CC0 |

- 기사: [Knight (Rigged - Mid Poly), crownjoshua](https://opengameart.org/content/knight-rigged-mid-poly), [원본 blend](https://opengameart.org/sites/default/files/Knight_0.blend).
- 의상: [Quaternius Modular Character Outfits – Fantasy](https://quaternius.com/packs/modularcharacteroutfitsfantasy.html)의 무료 **Standard**. 유료 Source 미사용. [공식 다운로드](https://quaternius.itch.io/modular-character-outfits-fantasy).
- 얼굴: [VRoid CC0 안내](https://vroid.pixiv.help/hc/en-us/articles/4402614652569), [AvatarSample_C 등 별도 샘플 조건](https://vroid.pixiv.help/hc/en-us/articles/4402394424089). C는 수정·무료 재배포가 허용되지만 CC0로 재지정, 샘플 데이터 자체 유료 재배포, 캐릭터 제작 서비스로의 데이터 전용 등은 금지된다. 원 조건을 그대로 따른다.
- 파일 해시·구성 요소별 조건: [imported-models.json](./imported-models.json). 최종 VRM의 권리 메타데이터도 보존했다.
- 변환: `scripts/import-cc0-knight.py`, `scripts/import-cc0-outfits.py`. 원본은 `.local/character-import-20261104`에 보관한다. 외부 blend 내장 스크립트는 실행하지 않는다. baseColor 텍스처 원본 해상도를 유지한다.
- 로컬 목록은 총69종, 공개 허용 목록은27종이다. 공개 빌드는 `avatar-assets.mjs`가 허용한27개 `.vrm`만 복사하고 실제 목록을 검사한다. 로컬42종은 배포 파일에서 제외한다. 다른 기존 모델은 아래의 개별 조건을 따른다.

## VRoid Hub 모델 (작가별 이용 조건)

사령관님이 VRoid Hub에서 로그인해 직접 받은 모델. 조건은 파일 안 VRM meta와 VRoid Hub 페이지 기준.

| 파일 | 캐릭터 / 작가 | 출처 | 조건 |
|---|---|---|---|
| vroidhub-surikuo.vrm | スリクオちゃん / なみぞー(人並) | VRoid Hub 모델 ID 2663549116253017604 | 누구나 아바타 사용 허용, 수정·재배포·상업 허용, 폭력·성적 표현 금지, **출처 표기 필요** |
| vroidhub-raja.vrm | 閻魔 ラジャ【ｴﾝﾏ　ﾗｼﾞｬ】 / ラジャちゃん変化前 / ホウホケキヨ | VRoid Hub 모델 1686801643915325630 | 출처 표기 필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-megumin.vrm | Megumin / Madoka-Senpai | VRoid Hub 모델 1850674197255889285 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-ukon.vrm | 右近 / キツネツキ | VRoid Hub 모델 9051368064615794365 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-elfboy.vrm | Elf boy / Tanman | VRoid Hub 모델 4003748146497290413 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-jirai.vrm | ジライちゃん / Mayura | VRoid Hub(파일 내 VRM meta) | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-semireal-girl.vrm | Semi-Realistic Girl / Outfit 1 / Reitanna | VRoid Hub 모델 1360625021277357397 | 출처 표기 필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-avalon-male.vrm | 男性オリジナルキャラ /  male character ver.2 / avalon | VRoid Hub 모델 1243076277285045253 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-kinpatsuko.vrm | 金髪子 / 制服 / さかまた | VRoid Hub 모델 3808940577700965946 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-furious.vrm | Ftest / furious / Furious | VRoid Hub 모델 3815992723203505783 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-tanaka-kun.vrm |  Tanaka-kun wa Itsumo Kedaruge! / Tanaka-kun / Haru | VRoid Hub 모델 5988429740704561988 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-haachan-ancient.vrm | はーちゃん / 古の魔女服 / 人並 | VRoid Hub 모델 7292898613382004478 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-eboy.vrm | E-Boy / Tanman | VRoid Hub 모델 5660112437186557354 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-cyber-waiter.vrm | サイバーふう、ショタ / ウェイターバージョン / ショタ捕獲作戦 | VRoid Hub 모델 8834564284178776343 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-osashi-1.vrm | Osashi (Vroid Mobile) / Outfit 1 - DL  / Akito アキト【SOA】 | VRoid Hub 모델 3350701827123916219 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-wolfboy.vrm | wolf boy / lecocoroti | VRoid Hub 모델 4205303764678706801 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-boyfriend.vrm | Boyfriend (FNF) / Sell/Hank 7 | VRoid Hub 모델 2428090947414281566 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-aisharis.vrm | アイシャリス / VER2.0 / やひろ | VRoid Hub 모델 2051842897924180489 | 출처 표기 불필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-alchemist-girl.vrm | 錬金術師の少女 / 可憐な錬金術師の服 / マユラ | VRoid Hub 모델 9111574850521170825 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-iori.vrm | 横河原伊織 / スリーピーススーツ / 歩留マリ | VRoid Hub 모델 1764981851681763317 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-rubia.vrm | ルビア / 魔導士風味 / ルトリス | VRoid Hub 모델 3594210062286763373 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-dark-magical.vrm | 魔法少女 / 闇落ち魔法少女ちゃん / マユラ | VRoid Hub 모델 1422268910831560484 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-xbox-girl.vrm | Xbox Girls / Xbox Girl White / Scott | VRoid Hub 모델 2692099439816868159 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 허용 |
| vroidhub-chikara-mage.vrm | Chikara Mage - Model / Chikara Mage / 𝕊aiko ℂhikara | VRoid Hub 모델 4043520454439607439 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-uwa-ainan.vrm | 宇和愛南 / 制服 / 歩留マリ | VRoid Hub 모델 120682071569470123 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-keith.vrm | Keith/Boyfriend / h / さけび | VRoid Hub 모델 1383231684650162397 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-goku.vrm | Goku Ultra instint dominado / Goku Ul / wea_maxigrec | VRoid Hub 모델 8293060105138204950 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-boyfriend-2.vrm | Boyfriend (Cam/Keith/Evan) / Friday Night Funkin' / Kittenpawz 💖 | VRoid Hub 모델 6208415232804548317 | 출처 표기 필요, 수정 금지, 재배포 허용, 기업 상업 금지 |
| vroidhub-ken.vrm | 謙 / Cool Boy / Snow Black | VRoid Hub 모델 621730251299475051 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-aoi-maid.vrm | アオイ / メイド水着コスプレ / Tovie | VRoid Hub 모델 4424478886993247570 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-reya.vrm | れーやちゃん / 水髪狐耳美少女 / れーや | VRoid Hub 모델 7752104927107848529 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-haachan-village.vrm | はーちゃん / 村はずれの魔女 / 人並 | VRoid Hub 모델 3090837108307646198 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-rino-tanaka.vrm |  Tanaka-kun wa Itsumo Kedaruge! / Rino Tanaka / Haru | VRoid Hub 모델 5853616195989493787 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-konko.vrm | 【ベスティア学園】白玉こんこテストモデル0.2【配布】 / 【ベスティア学園】白玉こんこテストモデル0.2 / れぇぐ | VRoid Hub 모델 8253325362347273144 | 출처 표기 필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-sendi.vrm | Sendi / knight Sendi / 아기쥐작업소 | VRoid Hub 모델 8394976304042071939 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-inuko.vrm | 異世界　犬子 / セーラー服(旧モデル) / 異世界　犬子 | VRoid Hub 모델 5951381068241595436 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-tomari-mari.vrm | 兎鞠まりちゃん[Tomarimari1st@ElsieEdit] / 兎鞠まりちゃん[初期衣装]＠ElsieEstuary改変 / t | VRoid Hub 모델 5775446143141604484 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-hayato.vrm | ハヤト / ベスト / Free Slope | VRoid Hub 모델 7120739048128891672 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-boyskin.vrm | BoySkin / -Amyy- | VRoid Hub 모델 3358978848726404168 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-alchemy-chan.vrm | アルケミーちゃん / キュートな錬金術師コーデ / マユラ | VRoid Hub 모델 5672365290409662847 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-chapelle.vrm | シャペル / ウンフェルス | VRoid Hub 모델 406149290929678011 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-onyankopon.vrm | オニャンコポン[Onyankopon]@Vtuber / オニャンコポン（珠野うみかのすがた） / t | VRoid Hub 모델 789826898984062624 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-rick.vrm | リック / 制服ver / Free Slope | VRoid Hub 모델 5232644748031178713 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-chiffonna.vrm | シフォンナ / シフォンナver2.0 / やひろ | VRoid Hub 모델 1788277721215456764 | 출처 표기 불필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-kenma.vrm | Haikyuu - Kozume Kenma / Ponytail&BlackShirt / esapsejo | VRoid Hub 모델 6112922286473846657 | 출처 표기 필요, 수정 금지, 재배포 허용, 기업 상업 허용 |
| vroidhub-sample-c-noble.vrm | AvatarSample_C / AvatarSample_C (Fantasy Noble) / HunterRayder93 | VRoid Hub 모델 1873380381049175398 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-osashi-2.vrm | Osashi (Vroid Mobile) / Outfit 2 - DL  / Akito アキト【SOA】 | VRoid Hub 모델 1358938964548343431 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-military.vrm | ミリタリーちゃん / mayura | VRoid Hub(파일 내 VRM meta) | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 금지 |
| vroidhub-sample-c.vrm | AvatarSample_C / VRoid Project | VRoid Hub(파일 내 VRM meta) | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-muacca.vrm | Muacca / Muaccaオクトーバー / Muacca | VRoid Hub 모델 4590519451429794613 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-suoh.vrm | Suoh Goshuin (Beyblade Burst / Suoh Goshuin / Boigamer225 | VRoid Hub 모델 6349078218383390206 | 출처 표기 필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-kusaha-el.vrm | 草羽エル｜Kusaha.El / 【無料配布】【改変OK】モノ草羽エル（LOW版） / 草羽エル-Kusaha.El- | VRoid Hub 모델 8465930083918545653 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 금지 |
| vroidhub-toshi.vrm | Toshi Nakamura / ToshiZ64 | VRoid Hub 모델 7710824402211223573 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-hikari.vrm | 光莉 / 学者 / あわ | VRoid Hub 모델 4411539083619763989 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-sakusa.vrm | Kiyoomi Sakusa / Mixpomdog | VRoid Hub 모델 6225919731412999664 | 출처 표기 필요, 수정 금지, 재배포 금지, 기업 상업 금지 |
| vroidhub-boy-tbb.vrm | Boy TBB / Boy (Free downloadable) / GratiaXJuan | VRoid Hub 모델 7352278248972262517 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-zunko.vrm | 東北ずん子 / 東北ずん子 ver.0.90 / 白犬 | VRoid Hub 모델 6068790342834587625 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-ikun.vrm | vroid_test01 / ikunikun | VRoid Hub 모델 1196758498323841206 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-nameless-boy.vrm | NamelessBoy(Remaked) / To Your Eternity Season 1  / RayZmanJR777 | VRoid Hub 모델 5986673738915466518 | 출처 표기 필요, 수정 금지, 재배포 허용, 기업 상업 금지 |
| vroidhub-gordon.vrm | Half-Life - Anime Style / Gordon Freeman - Black Mesa / NorthrnPoakr | VRoid Hub 모델 8781068812319436327 | 출처 표기 필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
| vroidhub-surikuo-ancient.vrm | スリクオちゃん / 古の魔女服 / 人並 | VRoid Hub 모델 2227957585320395369 | 출처 표기 불필요, 수정 허용, 재배포 금지, 기업 상업 허용 |
| vroidhub-yukino.vrm | Yukino / キャラクター紹介サイト管理人 | VRoid Hub 모델 5980288181004812901 | 출처 표기 불필요, 수정 허용, 재배포 허용, 기업 상업 허용 |
