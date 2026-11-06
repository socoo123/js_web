import { useEffect, useId, useRef, useState } from 'react';
import products from '../../../examples/shared/products.json';
import './demos.css';

const P001 = products.find((product) => product.id === 'P001');

const VARIANTS = {
  value: {
    title: '传值：setStock(stock + 1)',
    code: 'setStock(stock + 1);\nsetStock(stock + 1);\nsetStock(stock + 1);',
  },
  updater: {
    title: '传函数：setStock(previous => previous + 1)',
    code: 'setStock((previous) => previous + 1);\nsetStock((previous) => previous + 1);\nsetStock((previous) => previous + 1);',
  },
};

// 表格按 React 处理队列的规则逐项列出；页面上的库存来自真实的 useState。
function QueueColumn({ variant, ready }) {
  const [stock, setStock] = useState(P001.stock);
  const [trace, setTrace] = useState(null);
  const { title, code } = VARIANTS[variant];

  function restockThree() {
    const rows = [];
    let pending = stock;
    for (let step = 1; step <= 3; step += 1) {
      if (variant === 'value') {
        setStock(stock + 1);
        pending = stock + 1;
        rows.push({ step, queued: `替换为 ${stock + 1}`, result: pending });
      } else {
        setStock((previous) => previous + 1);
        pending += 1;
        rows.push({ step, queued: 'previous => previous + 1', result: pending });
      }
    }
    setTrace((old) => ({ id: (old?.id ?? 0) + 1, snapshot: stock, rows }));
  }

  const added = trace ? trace.rows.at(-1).result - trace.snapshot : 0;
  return (
    <div className="jsd-box">
      <p className="jsd-box-title">{title}</p>
      <pre><code>{code}</code></pre>
      <div className="jsd-row">
        <button type="button" disabled={!ready} onClick={restockThree}>连续补三件</button>
      </div>
      <p className="jsd-stock" role="status">
        <span>P001 当前库存</span>
        <span className="jsd-number" key={stock} data-changed="">{stock}</span>
        <span>件</span>
      </p>
      {trace ? (
        <>
          <table className="jsd-table" key={trace.id}>
            <caption className="jsd-hint">处理函数里读到的 stock：{trace.snapshot}（本次渲染的快照）</caption>
            <thead><tr><th scope="col">#</th><th scope="col">排入队列</th><th scope="col">处理后</th></tr></thead>
            <tbody>
              {trace.rows.map((row) => (
                <tr key={row.step} style={{ '--i': row.step - 1 }}>
                  <td>{row.step}</td><td><code>{row.queued}</code></td><td>{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={added === 3 ? 'jsd-ok' : 'jsd-err'}>
            {added === 3 ? '✓ 三次都接着上一步算，多了 3 件' : `✗ 三次都替换成同一个值，只多了 ${added} 件`}
          </p>
        </>
      ) : (
        <p className="jsd-hint">点按钮后，这里按顺序列出排入队列的三项。</p>
      )}
    </div>
  );
}

function DelayLab({ ready }) {
  const name = useId();
  const [stock, setStock] = useState(P001.stock);
  const [mode, setMode] = useState('updater');
  const [delay, setDelay] = useState(3);
  const [events, setEvents] = useState([]);
  const [pending, setPending] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const timers = useRef(new Map());
  const origin = useRef(null);
  const shown = useRef(stock);
  const nextKey = useRef(1);

  useEffect(() => () => { for (const { timer } of timers.current.values()) clearTimeout(timer); }, []);
  useEffect(() => {
    if (shown.current === stock) return;
    shown.current = stock;
    record(`页面显示 ${stock}`);
  }, [stock]);

  function record(text) {
    if (origin.current === null) origin.current = performance.now();
    const time = ((performance.now() - origin.current) / 1000).toFixed(1);
    setEvents((list) => [...list, { key: list.length, time, text }]);
  }

  function restockLater() {
    const snapshot = stock;
    const useUpdater = mode === 'updater';
    const key = nextKey.current++;
    const entry = { overlapped: false, timer: 0 };
    record(`点「延迟补三件」：回调记住 stock = ${snapshot}，${delay} 秒后执行`);
    entry.timer = setTimeout(() => {
      timers.current.delete(key);
      setPending((list) => list.filter((item) => item.key !== key));
      if (useUpdater) {
        record('定时器执行 setStock(previous => previous + 3)');
        setStock((previous) => previous + 3);
      } else {
        record(`定时器执行 setStock(stock + 3)：这里的 stock 仍是 ${snapshot}，替换为 ${snapshot + 3}`);
        setStock(snapshot + 3);
      }
      if (entry.overlapped) {
        setVerdict(useUpdater
          ? { ok: true, text: '✓ updater 从执行时的待更新值算起，中途补的一件保留了' }
          : { ok: false, text: '✗ 旧值替换覆盖了中途补的一件' });
      }
    }, delay * 1000);
    timers.current.set(key, entry);
    setPending((list) => [...list, { key, delay }]);
    setVerdict(null);
  }

  function restockNow() {
    for (const entry of timers.current.values()) entry.overlapped = true;
    record('点「立即补一件」：setStock(previous => previous + 1)');
    setStock((previous) => previous + 1);
  }

  return (
    <section className="jsd-box" aria-label="延迟补货">
      <p className="jsd-box-title">② 延迟补货：先点「延迟补三件」，等待期间再点「立即补一件」</p>
      <fieldset disabled={!ready}>
        <legend>定时器里怎样更新</legend>
        <label>
          <input type="radio" name={name} value="updater" checked={mode === 'updater'} onChange={() => setMode('updater')} />
          <code>setStock(previous =&gt; previous + 3)</code>
        </label>
        <label>
          <input type="radio" name={name} value="value" checked={mode === 'value'} onChange={() => setMode('value')} />
          <code>setStock(stock + 3)</code>（点击时的值）
        </label>
      </fieldset>
      <div className="jsd-row">
        <label>
          延迟
          <input type="range" min="1" max="5" step="1" value={delay} disabled={!ready}
            aria-valuetext={`${delay} 秒`} onChange={(event) => setDelay(Number(event.target.value))} />
          {delay} 秒
        </label>
      </div>
      <div className="jsd-row">
        <button type="button" disabled={!ready} onClick={restockLater}>延迟补三件</button>
        <button type="button" disabled={!ready} onClick={restockNow}>立即补一件</button>
      </div>
      <p className="jsd-stock" role="status">
        <span>P001 当前库存</span>
        <span className="jsd-number" key={stock} data-changed="">{stock}</span>
        <span>件</span>
      </p>
      {pending.map((item) => (
        <div key={item.key} className="jsd-grid">
          <span className="jsd-hint">定时器等待中（{item.delay} 秒）</span>
          <div className="jsd-meter" aria-hidden="true"><span style={{ animationDuration: `${item.delay}s` }} /></div>
        </div>
      ))}
      <p aria-live="polite" className={verdict ? (verdict.ok ? 'jsd-ok' : 'jsd-err') : 'jsd-hint'}>
        {verdict ? verdict.text : ''}
      </p>
      <ol className="jsd-log" aria-label="时间线">
        {events.length === 0
          ? <li className="jsd-log-empty">操作后，这里按时间记录每一步。</li>
          : events.map((event) => (
            <li key={event.key}><span className="jsd-time">{event.time} s</span>{event.text}</li>
          ))}
      </ol>
    </section>
  );
}

export default function C23UpdateQueue() {
  const [ready, setReady] = useState(false);
  const [round, setRound] = useState(0);
  useEffect(() => setReady(true), []);
  return (
    <div className="jsd">
      <section className="jsd-box" aria-label="一次点击排三次更新">
        <p className="jsd-box-title">① 一次点击排三次更新：两边都从 12 开始</p>
        <div className="jsd-grid jsd-grid-2">
          <QueueColumn key={`value-${round}`} variant="value" ready={ready} />
          <QueueColumn key={`updater-${round}`} variant="updater" ready={ready} />
        </div>
      </section>
      <DelayLab key={`delay-${round}`} ready={ready} />
      <div className="jsd-row">
        <button type="button" className="jsd-secondary" disabled={!ready} onClick={() => setRound((value) => value + 1)}>
          全部重置为 12
        </button>
      </div>
    </div>
  );
}
