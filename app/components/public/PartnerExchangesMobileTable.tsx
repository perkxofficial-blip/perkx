'use client'
import { useTranslations } from 'next-intl'
import Image from "next/image";
import {Exchange, ExchangeProduct} from "@/services/api/public/exchange";
import { useState } from 'react';

interface PartnerExchangesTableProps {
  exchanges: Exchange[]
}

export default function PartnerExchangesMobileTable({ exchanges }: PartnerExchangesTableProps) {
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
    <div className="exchanges-mobile">
      {exchanges.map((exchange: Exchange, index: number) => {
        const selectedProduct = getSelectedProduct(exchange.id, exchange)

        return (
          <div className={`exchange-card col-12 ${index < 3 ? 'pe-top' : ''}`} key={index}>
            <div className="row d-flex align-items-center">
              <div className="col-6">
                <Image
                  src={exchange.logo_url}
                  alt={exchange.name}
                  width={36}
                  height={36}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="col-6">
                <div className="text-end">
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
                </div>
              </div>
            </div>
            <div className="row justify-content-start">
              <div className="col-12 exchange-card-info">
                <h4 className="exchange-title">{exchange.name}</h4>
                <p>{t('discount_rate')}: <strong>{selectedProduct?.discount || 0}%</strong></p>
                <p>{t('default_taker')}: <strong>{selectedProduct?.default_fee_maker || 0}% / {selectedProduct?.default_fee_taker || 0}%</strong></p>
                <p>{t('final_taker')}: <strong>{selectedProduct?.final_fee_maker || 0}% / {selectedProduct?.final_fee_taker || 0}%</strong></p>
                <p>{t('avg_rebate')}: <strong>${selectedProduct?.ave_rebate?.toLocaleString() || 0}</strong></p>
                <a
                  href={selectedProduct?.exchange_signup_link || exchange.affiliate_link || '#'}
                  className="pe-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('register')}
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
