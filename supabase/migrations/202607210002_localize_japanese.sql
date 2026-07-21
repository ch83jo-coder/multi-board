update public.boards
set
  name = case slug
    when 'humor' then 'ユーモア'
    when 'news' then 'ニュース'
    when 'sports' then 'スポーツ'
    when 'game' then 'ゲーム'
    else name
  end,
  description = case slug
    when 'humor' then 'ジョークやミーム、日常の笑いを気軽に共有するボードです。'
    when 'news' then '国内外の最新ニュースについて、じっくり意見を交わすボードです。'
    when 'sports' then '試合速報、分析、移籍情報、勝敗予想を楽しむボードです。'
    when 'game' then 'ゲーム、ハードウェア、新作、攻略情報を共有するボードです。'
    else description
  end
where slug in ('humor', 'news', 'sports', 'game');
