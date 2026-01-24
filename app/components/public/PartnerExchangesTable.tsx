import { useTranslations } from 'next-intl'
import Image from "next/image";

export default function PartnerExchangesTable() {
  const t = useTranslations('home.table')
  const data: any = []

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
        <tr>
          <th>{t('exchanges')}</th>
          <th>{t('product')}</th>
          <th>{t('discount_rate')}</th>
          <th>{t('default_taker')}</th>
          <th>{t('final_taker')}</th>
          <th>{t('ave_rebate')}</th>
          <th>{t('action')}</th>

        </tr>
        </thead>

        <tbody>
        <tr className='pe-top'>
          <td>
            <div className='d-flex align-items-center gap-2'>
              <Image
                src="/images/bitcoint.png"
                alt="Binance"
                width={36}
                height={36}
                aria-hidden="true"
              />
              <strong>Binance</strong>
            </div>
          </td>
          <td>
            <div className="btn-group">
              <button
                type="button"
                className="btn pe-dropdown dropdown-toggle d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Spot
                <Image
                  src="/images/arrow-down.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <ul className="dropdown-menu" aria-label="Language selection">
                <li>
                  <a className="dropdown-item" href="">Spot</a>
                  <a className="dropdown-item" href="">USDT-M Futures</a>
                  <a className="dropdown-item" href="">COIN-M Futures</a>
                </li>

              </ul>
            </div>
          </td>
          <td>20%</td>
          <td>0.1% / 0.1%</td>
          <td>0.08% / 0.08%</td>
          <td>$2,000</td>
          <td>
            <button className="pe-btn">
              Register
            </button>
          </td>
        </tr>
        <tr className='pe-top'>
          <td>
            <div className='d-flex align-items-center gap-2'>
              <Image
                src="/images/bitcoint.png"
                alt="Binance"
                width={36}
                height={36}
                aria-hidden="true"
              />
              <strong>Binance</strong>
            </div>
          </td>
          <td>
            <div className="btn-group">
              <button
                type="button"
                className="btn pe-dropdown dropdown-toggle d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Spot
                <Image
                  src="/images/arrow-down.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <ul className="dropdown-menu" aria-label="Language selection">
                <li>
                  <a className="dropdown-item" href="">Spot</a>
                  <a className="dropdown-item" href="">USDT-M Futures</a>
                  <a className="dropdown-item" href="">COIN-M Futures</a>
                </li>

              </ul>
            </div>
          </td>
          <td>20%</td>
          <td>0.1% / 0.1%</td>
          <td>0.08% / 0.08%</td>
          <td>$2,000</td>
          <td>
            <button className="pe-btn">
              Register
            </button>
          </td>
        </tr>
        <tr className='pe-top'>
          <td>
            <div className='d-flex align-items-center gap-2'>
              <Image
                src="/images/bitcoint.png"
                alt="Binance"
                width={36}
                height={36}
                aria-hidden="true"
              />
              <strong>Binance</strong>
            </div>
          </td>
          <td>
            <div className="btn-group">
              <button
                type="button"
                className="btn pe-dropdown dropdown-toggle d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Spot
                <Image
                  src="/images/arrow-down.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <ul className="dropdown-menu" aria-label="Language selection">
                <li>
                  <a className="dropdown-item" href="">Spot</a>
                  <a className="dropdown-item" href="">USDT-M Futures</a>
                  <a className="dropdown-item" href="">COIN-M Futures</a>
                </li>

              </ul>
            </div>
          </td>
          <td>20%</td>
          <td>0.1% / 0.1%</td>
          <td>0.08% / 0.08%</td>
          <td>$2,000</td>
          <td>
            <button className="pe-btn">
              Register
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <div className='d-flex align-items-center gap-2'>
              <Image
                src="/images/bitcoint.png"
                alt="Binance"
                width={36}
                height={36}
                aria-hidden="true"
              />
              <strong>Binance</strong>
            </div>
          </td>
          <td>
            <div className="btn-group">
              <button
                type="button"
                className="btn pe-dropdown dropdown-toggle d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Spot
                <Image
                  src="/images/arrow-down.svg"
                  alt="arrow right line"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <ul className="dropdown-menu" aria-label="Language selection">
                <li>
                  <a className="dropdown-item" href="">Spot</a>
                  <a className="dropdown-item" href="">USDT-M Futures</a>
                  <a className="dropdown-item" href="">COIN-M Futures</a>
                </li>

              </ul>
            </div>
          </td>
          <td>20%</td>
          <td>0.1% / 0.1%</td>
          <td>0.08% / 0.08%</td>
          <td>$2,000</td>
          <td>
            <button className="pe-btn">
              Register
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}
