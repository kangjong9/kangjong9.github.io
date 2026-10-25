// 방문자 카운터: '오늘 할 일' 메모 아래에 오늘 방문자 / Total 방문자를 표시한다.
// 저장은 무료 카운터 API(abacus)에 맡긴다. 개인정보는 보내지 않고 +1 요청만 보낸다.
// 같은 브라우저는 하루(한국 시간) 한 번만 센다. 다시 들어오면 숫자만 읽어온다.
(() => {
  const box = document.querySelector('[data-visits]');
  if (!box) return;
  const API = 'https://abacus.jasoncameron.dev';
  const NS = 'kangjong9-github-io';
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replace(/-/g, '');
  let seen = '';
  try { seen = localStorage.getItem('visit_counted_day') || ''; } catch (e) { /* 저장소 차단 시 매번 셈 */ }
  const first = seen !== day;

  const count = async (key) => {
    const res = await fetch(`${API}/${first ? 'hit' : 'get'}/${NS}/${key}`, { cache: 'no-store' });
    if (res.status === 404) return 0; // 아직 아무도 안 센 날
    if (!res.ok) throw new Error(`visits ${res.status}`);
    return (await res.json()).value;
  };
  const show = (today, total) => {
    box.querySelector('[data-visits-today]').textContent = today;
    box.querySelector('[data-visits-total]').textContent = total;
  };

  Promise.all([count(`day-${day}`), count('total')])
    .then(([today, total]) => {
      show(today.toLocaleString('ko-KR'), total.toLocaleString('ko-KR'));
      if (first) { try { localStorage.setItem('visit_counted_day', day); } catch (e) { /* 무시 */ } }
    })
    .catch(() => show('-', '-'));
})();
