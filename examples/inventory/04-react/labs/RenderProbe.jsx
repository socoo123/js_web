export default function RenderProbe({ label }) {
  console.log("RenderProbe render", label); // 仅用于观察调用，实验后删除
  return (
    <section>
      <h2>{label}</h2>
      <label htmlFor="note">盘点备注</label>
      <input id="note" />
    </section>
  );
}
