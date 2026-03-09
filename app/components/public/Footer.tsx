import Image from "next/image";
import {getTranslations} from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="footer">
      <div className="container">
       <div className="row mb-3">
         <div className="col-md-4">
           <Image
             src="/images/logo.png"
             alt={t('meta.home.title')}
             width={123} // chỉnh theo kích thước logo thực tế
             height={41}
             priority // load sớm cho SEO/LCP
           />
         </div>
         <div className="col-md-4 hidden-mb">
           <p className="footer-title">{t('footer.platform')}</p>
         </div>
         <div className="col-md-4 hidden-mb">
           <p className="footer-title">{t('footer.resources')}</p>
         </div>
       </div>
        <div className="row footer-info">
          <div className="col-md-4"><p>{t('footer.desc')}</p></div>
          <div className="col-md-4 show-mb">
            <p className="footer-title">{t('footer.platform')}</p>
          </div>
          <div className="col-md-4">
            <div className="d-flex justify-content-start">
              <ul className="text-start">
                <li><a href="/exchanges">{t('footer.exchange_rebates')}</a></li>
                <li><a href="/calculator">{t('footer.profit_calculator')}</a></li>
              </ul>
            </div>
          </div>
          <div className="col-md-4 show-mb">
            <p className="footer-title">{t('footer.resources')}</p>
          </div>
          <div className="col-md-4">
            <div className="d-flex justify-content-start">
              <ul className="text-start">
                <li><a href="/help-center">{t('footer.help_center')}</a></li>
                <li><a href="/term-of-use">{t('footer.terms_of_use')}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row d-flex align-items-center copyright">
          <div className="col-md-8 text-copyright">
            <p className="mb-0">{t('footer.copyright')}</p>
          </div>

          <div className="col-md-4 text-md-end text-start">
            <div className="d-flex justify-content-md-end justify-content-start gap-3">
              <a href="https://www.instagram.com/perkx_official" target="_blank" aria-label="Instagram">
                <Image src="/images/insta.svg" alt="Instagram" width={48} height={48} />
              </a>
              <a href="https://www.reddit.com/u/PerkX_Official/s/WsGGTcfejo" target="_blank" aria-label="Reddit">
                <Image src="/images/reddit.svg" alt="Reddit" width={48} height={48} />
              </a>
              <a href="https://t.me/perkx_official" target="_blank" aria-label="Telegram">
                <Image src="/images/tele.svg" alt="Telegram" width={48} height={48} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
