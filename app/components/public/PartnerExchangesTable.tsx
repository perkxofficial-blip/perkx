'use client'
import { useTranslations } from 'next-intl'
import Image from "next/image";
import {Exchange, ExchangeProduct} from "@/services/api/public/exchange";
import { useState } from 'react';

interface PartnerExchangesTableProps {
  exchanges: Exchange[]
}

export default function PartnerExchangesTable({ exchanges }: PartnerExchangesTableProps) {
  const t = useTranslations('home.table')
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: ExchangeProduct}>({})

  const getDefaultProduct = (exchange: Exchange) => {
    return exchange.products?.[0] || null
  }

  const getSelectedProduct = (exchangeId: number, exchange: Exchange) => {
    return selectedProducts[exchangeId] || getDefaultProduct(exchange)
  }

  const handleProductSelect = (exchangeId: number, product: ExchangeProduct) => {
    setSelectedProducts(prev => ({
      ...prev,
      [exchangeId]: product
    }))
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
        <tr>
          <th className="text-start" style={{ width: '14%' }}>{t('exchanges')}</th>
          <th className="text-start" style={{ width: '18%' }}>{t('product')}</th>
          <th className="text-end" style={{ width: '10%' }}>{t('discount_rate')}</th>
          <th className="text-end" style={{ width: '14%' }}>{t('default_taker')}</th>
          <th className="text-end" style={{ width: '14%' }}>{t('final_taker')}</th>
          <th className="text-end" style={{ width: '14%' }}>{t('ave_rebate')}</th>
          <th className="text-end" style={{ width: '14%' }}>{t('action')}</th>
        </tr>
        </thead>

        <tbody>
        {exchanges.map((exchange: Exchange, index: number) => {
          const selectedProduct = getSelectedProduct(exchange.id, exchange)
          
          return (
            <tr className={index < 3 ? 'pe-top' : ''} key={exchange.id}>
              <td className="text-start">
                <div className='d-flex align-items-center gap-2'>
                  <Image
                    src={exchange.logo_url}
                    alt={exchange.name}
                    width={36}
                    height={36}
                    aria-hidden="true"
                    unoptimized
                  />
                 {exchange.name}
                </div>
              </td>
              <td className="text-start">
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn pe-dropdown dropdown-toggle d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {selectedProduct?.product_name || 'Select Product'}
                    <Image
                      src="/images/arrow-down.svg"
                      alt="arrow down"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                  </button>

                  <ul className="dropdown-menu">
                    {exchange.products?.map((product) => (
                      <li key={product.id}>
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleProductSelect(exchange.id, product)
                          }}
                        >
                          {product.product_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </td>
              <td className="text-end" >{selectedProduct?.discount || 0}%</td>
              <td className="text-end" >{selectedProduct?.default_fee_maker || 0}% / {selectedProduct?.default_fee_taker || 0}%</td>
              <td className="text-end" >{selectedProduct?.final_fee_maker || 0}% / {selectedProduct?.final_fee_taker || 0}%</td>
              <td className="text-end" >${selectedProduct?.ave_rebate?.toLocaleString() || 0}</td>
              <td className="d-flex justify-content-end text-end">
                <a 
                  href={selectedProduct?.exchange_signup_link || exchange.affiliate_link || '#'} 
                  className="pe-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('register')}
                </a>
              </td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )
}
