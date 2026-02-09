'use client';

import { useState, useMemo } from 'react';
import { Exchange } from '@/services/api/public/exchange';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface CalculatorCardProps {
  exchanges: Exchange[];
}

export default function CalculatorCard({ exchanges }: CalculatorCardProps) {
  const t = useTranslations();
  const [tradingVolume, setTradingVolume] = useState(10000000); // Default $10M
  const [selectedExchange, setSelectedExchange] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');

  // Get selected exchange object
  const currentExchange = useMemo(() => {
    if (!selectedExchange) return null;
    return exchanges.find(ex => ex.id.toString() === selectedExchange) || null;
  }, [selectedExchange, exchanges]);

  // Get available products for selected exchange
  const availableProducts = useMemo(() => {
    return currentExchange?.products || [];
  }, [currentExchange]);

  // Get selected product object
  const currentProduct = useMemo(() => {
    if (!selectedProduct) return null;
    return availableProducts.find(p => p.id.toString() === selectedProduct) || null;
  }, [selectedProduct, availableProducts]);

  // Reset product when exchange changes
  const handleExchangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExchange(e.target.value);
    setSelectedProduct(''); // Reset product selection
  };

  // Calculate percentage based on slider position
  const volumePercentage = useMemo(() => {
    const min = 10000; // $10K
    const max = 50000000; // $50M
    return ((tradingVolume - min) / (max - min)) * 100;
  }, [tradingVolume]);

  // Calculate cashback based on fee difference
  const monthlyCashback = useMemo(() => {
    if (!currentProduct) {
      // No calculation if no product selected
      return 0;
    }
    
    // Get fees based on selected fee type
    const defaultFee = selectedFeeType === 'taker' 
      ? currentProduct.default_fee_taker 
      : currentProduct.default_fee_maker;
    
    const finalFee = selectedFeeType === 'taker'
      ? currentProduct.final_fee_taker
      : currentProduct.final_fee_maker;
    
    // Monthly Cashback = Monthly Trading Volume * (Default Fee - Final Fee)
    // Fees are in percentage, need to divide by 100
    const feeReduction = (defaultFee - finalFee) / 100;
    return tradingVolume * feeReduction;
  }, [tradingVolume, currentProduct, selectedFeeType]);

  const annualSavings = monthlyCashback * 12;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTradingVolume(Number(e.target.value));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatVolume = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="calculator-card">
      <div className="calculator-card-body">
        <div className="calculator-main-content">
          {/* Left Section - Volume & Inputs */}
          <div className="calculator-left-section">
            {/* Volume Slider */}
            <div className="volume-section">
              <h3 className="volume-title">{t('calculator.volume_title')}</h3>
            </div>

            {/* Slider */}
            <div className="volume-slider-wrapper">
              <div className="slider-container">
                <input
                  type="range"
                  min="10000"
                  max="50000000"
                  step="10000"
                  value={tradingVolume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(239, 115, 209) 0%, 
                      rgb(179, 136, 244) ${volumePercentage}%, 
                      rgba(226, 228, 233, 0.24) ${volumePercentage}%, 
                      rgba(226, 228, 233, 0.24) 100%)`
                  }}
                />
                <div 
                  className="slider-handle" 
                  style={{ left: `${volumePercentage}%` }}
                />
              </div>
              <div className="slider-labels">
                <span className="slider-label-min">$10K</span>
                <span className="slider-label-current">{formatVolume(tradingVolume)}</span>
                <span className="slider-label-max">$50M+</span>
              </div>
            </div>

            {/* Dropdown Inputs */}
            <div className="calculator-inputs">
              <div className="input-group">
                <p className="input-label">{t('calculator.select_exchange')}</p>
                <select
                  value={selectedExchange}
                  onChange={handleExchangeChange}
                  className="calculator-select perkx-selector"
                >
                  <option value="" disabled selected>-</option>
                  {exchanges.map((exchange) => (
                    <option key={exchange.id} value={exchange.id}>
                      {exchange.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <p className="input-label">{t('calculator.select_product')}</p>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="calculator-select perkx-selector"
                >
                  <option value="" disabled selected>{selectedExchange ? '-' : '-'}</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <p className="input-label">{t('calculator.select_fee_type')}</p>
                <select
                  value={selectedFeeType}
                  onChange={(e) => setSelectedFeeType(e.target.value)}
                  className="calculator-select perkx-selector"
                >
                  <option value="" disabled>-</option>
                  <option value="taker">{t('calculator.fee_taker')}</option>
                  <option value="maker">{t('calculator.fee_maker')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Section - Results & CTA */}
          <div className="calculator-right-section">
            <div className="calculator-results">
              <div className="result-item">
                <p className="result-label">{t('calculator.monthly_cashback')}</p>
                <p className="result-value">{formatCurrency(monthlyCashback)}</p>
              </div>
              <div className="result-divider"></div>
              <div className="result-item">
                <p className="result-label">{t('calculator.annual_savings')}</p>
                <p className="result-value">{formatCurrency(annualSavings)}</p>
              </div>
            </div>

            <Link href="/exchanges" className="calculator-cta-btn">
              {t('calculator.claim_rebate_btn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
