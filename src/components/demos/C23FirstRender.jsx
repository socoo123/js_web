import { useCallback, useEffect, useId, useRef, useState } from 'react';
import products from '../../../examples/shared/products.json';
import './demos.css';

const choices = products.filter((product) => product.id === 'P001' || product.id === 'P002');

function StockActions({ product, ready, onIntent, onCommit }) {
  const [stock, setStock] = useState(product.stock);
  useEffect(() => { onCommit(product.stock, stock); }, [product, stock, onCommit]);
  return (
    <div className="jsd-box">
      <p className="jsd-box-title">子组件 StockActions</p>
      <pre><code>const [stock, setStock] = useState(product.stock);</code></pre>
      <p className="jsd-stock" role="status">
        <span>useState 收到 {product.stock}，返回 stock =</span>
        <span className="jsd-number" key={stock} data-changed="">{stock}</span>
      </p>
      <div className="jsd-row">
        <button type="button" disabled={!ready} onClick={() => { onIntent('点 +1 后'); setStock((previous) => previous + 1); }}>
          +1
        </button>
      </div>
    </div>
  );
}

export default function C23FirstRender() {
  const name = useId();
  const [ready, setReady] = useState(false);
  const [productId, setProductId] = useState('P001');
  const [round, setRound] = useState(0);
  const [log, setLog] = useState([]);
  const cause = useRef('首次渲染');
  useEffect(() => setReady(true), []);

  const product = choices.find((item) => item.id === productId);
  const onIntent = useCallback((text) => { cause.current = text; }, []);
  const onCommit = useCallback((argument, stock) => {
    const reason = cause.current || '重新渲染';
    const first = reason === '首次渲染';
    cause.current = '';
    setLog((entries) => [...entries, {
      key: entries.length,
      reason,
      text: `useState 收到 ${argument}，返回 ${stock}`,
      note: first ? '使用初始值' : '参数被忽略，返回 React 保存的值',
      first,
    }]);
  }, []);

  function choose(id) {
    if (id === productId) return;
    cause.current = `换成 ${id} 后`;
    setProductId(id);
  }
  function reset() {
    cause.current = '首次渲染';
    setLog([]);
    setProductId('P001');
    setRound((value) => value + 1);
  }

  return (
    <div className="jsd">
      <div className="jsd-box">
        <p className="jsd-box-title">父组件：决定传哪个 product</p>
        <fieldset disabled={!ready}>
          <legend>传给 StockActions 的 product</legend>
          {choices.map((item) => (
            <label key={item.id}>
              <input type="radio" name={name} value={item.id} checked={item.id === productId} onChange={() => choose(item.id)} />
              {item.id} {item.name}（product.stock = {item.stock}）
            </label>
          ))}
        </fieldset>
        <StockActions key={round} product={product} ready={ready} onIntent={onIntent} onCommit={onCommit} />
      </div>
      <div className="jsd-grid">
        <p className="jsd-box-title">每次提交后，useState 的参数与返回值</p>
        <ol className="jsd-log">
          {log.length === 0
            ? <li className="jsd-log-empty">首次渲染后，这里逐条记录 useState 收到什么、返回什么。</li>
            : log.map((entry) => (
              <li key={entry.key}>
                <span className="jsd-time">{entry.reason}</span>
                {entry.text}
                <span className={entry.first ? 'jsd-ok' : 'jsd-hint'}>（{entry.note}）</span>
              </li>
            ))}
        </ol>
      </div>
      <div className="jsd-row">
        <button type="button" className="jsd-secondary" disabled={!ready} onClick={reset}>重置演示</button>
        <span className="jsd-hint">先点 +1，再换成 P002，看 stock 有没有变成 0。</span>
      </div>
    </div>
  );
}
