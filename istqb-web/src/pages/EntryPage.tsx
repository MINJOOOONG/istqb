import { Link } from 'react-router-dom';

export default function EntryPage() {
  return (
    <div className="entry-page">
      <section className="entry-hero">
        <p className="entry-kicker">CTFL v4.0 study note</p>
        <h1>Minjoo’s ISTQB</h1>
        <p className="entry-copy">
          문제, 오답, 요약, 실러버스를 한 곳에서 빠르게 확인하세요.
        </p>
        <div className="entry-actions">
          <Link className="entry-primary-link" to="/practice">
            시작하기
          </Link>
          <Link className="entry-secondary-link" to="/summary">
            요약 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
