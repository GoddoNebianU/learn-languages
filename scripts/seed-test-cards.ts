/**
 * Seed test cards for the goddonebianu user.
 *
 * Creates 4 decks × 100+ cards each.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-test-cards.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type CardType = "WORD" | "PHRASE" | "SENTENCE";

type SeedCard = {
  word: string;
  ipa: string | null;
  queryLang: string;
  cardType: CardType;
  meanings: { partOfSpeech: string | null; definition: string; examples: { example: string; translation?: string | null }[] }[];
};

// ============================================
// Deck 1: 英语核心词汇 (100 WORD cards with IPA)
// ============================================
const vocabularyCards: SeedCard[] = [
  ["abandon", "/əˈbændən/", "v.", "放弃；抛弃", "He abandoned his old car."],
  ["ability", "/əˈbɪləti/", "n.", "能力；才能", "She has the ability to lead."],
  ["absorb", "/əbˈzɔːrb/", "v.", "吸收；理解", "Plants absorb sunlight."],
  ["abstract", "/ˈæbstrækt/", "adj.", "抽象的", "The concept is too abstract."],
  ["academic", "/ˌækəˈdemɪk/", "adj.", "学术的", "She has an academic background."],
  ["accelerate", "/əkˈseləreɪt/", "v.", "加速", "The car accelerated quickly."],
  ["accept", "/əkˈsept/", "v.", "接受；同意", "I accept your apology."],
  ["access", "/ˈækses/", "n.", "通道；使用权", "He has access to the building."],
  ["accident", "/ˈæksɪdənt/", "n.", "事故；意外", "The accident happened at night."],
  ["accomplish", "/əˈkʌmplɪʃ/", "v.", "完成；实现", "She accomplished her goal."],
  ["account", "/əˈkaʊnt/", "n.", "账户；描述", "I opened a bank account."],
  ["accurate", "/ˈækjərət/", "adj.", "准确的", "The measurements are accurate."],
  ["achieve", "/əˈtʃiːv/", "v.", "实现；达到", "He achieved great success."],
  ["acquire", "/əˈkwaɪər/", "v.", "获得；学到", "She acquired new skills."],
  ["adapt", "/əˈdæpt/", "v.", "适应；改编", "We adapted to the new environment."],
  ["address", "/əˈdres/", "n.", "地址；演讲", "What is your home address?"],
  ["adequate", "/ˈædɪkwət/", "adj.", "充足的；适当的", "The food is adequate for everyone."],
  ["adjust", "/əˈdʒʌst/", "v.", "调整；适应", "I need to adjust the settings."],
  ["administration", "/ədˌmɪnɪˈstreɪʃn/", "n.", "管理；行政", "The administration made a new policy."],
  ["admire", "/ədˈmaɪər/", "v.", "钦佩；欣赏", "I admire her courage."],
  ["admit", "/ədˈmɪt/", "v.", "承认；准许进入", "He admitted his mistake."],
  ["adopt", "/əˈdɒpt/", "v.", "采用；收养", "They adopted a new strategy."],
  ["advanced", "/ədˈvɑːnst/", "adj.", "高级的；先进的", "This is an advanced course."],
  ["advantage", "/ədˈvɑːntɪdʒ/", "n.", "优势；优点", "Speaking English is a big advantage."],
  ["adventure", "/ədˈventʃər/", "n.", "冒险；奇遇", "Their trip was a great adventure."],
  ["advertise", "/ˈædvərtaɪz/", "v.", "做广告；宣传", "They advertise on TV."],
  ["advice", "/ədˈvaɪs/", "n.", "建议；忠告", "Can you give me some advice?"],
  ["affect", "/əˈfekt/", "v.", "影响；感动", "The weather affects my mood."],
  ["afford", "/əˈfɔːrd/", "v.", "买得起；承担得起", "I can't afford a new car."],
  ["agency", "/ˈeɪdʒənsi/", "n.", "代理处；机构", "She works at a travel agency."],
  ["aggregate", "/ˈæɡrɪɡət/", "n.", "总计；合计", "The aggregate of all scores."],
  ["agriculture", "/ˈæɡrɪkʌltʃər/", "n.", "农业", "Agriculture is important here."],
  ["ancient", "/ˈeɪnʃənt/", "adj.", "古代的；古老的", "They study ancient history."],
  ["anticipate", "/ænˈtɪsɪpeɪt/", "v.", "预期；预料", "We anticipate a busy season."],
  ["anxious", "/ˈæŋkʃəs/", "adj.", "焦虑的；渴望的", "She felt anxious about the exam."],
  ["apologize", "/əˈpɒlədʒaɪz/", "v.", "道歉", "He apologized for being late."],
  ["appeal", "/əˈpiːl/", "v.", "呼吁；吸引", "The design appeals to young people."],
  ["appetite", "/ˈæpɪtaɪt/", "n.", "食欲；欲望", "I have a good appetite today."],
  ["approach", "/əˈprəʊtʃ/", "v.", "接近；方法", "We need a new approach."],
  ["appropriate", "/əˈprəʊpriət/", "adj.", "适当的", "Wear appropriate clothes."],
  ["approve", "/əˈpruːv/", "v.", "批准；赞成", "The board approved the plan."],
  ["arbitrary", "/ˈɑːrbɪtreri/", "adj.", "任意的；武断的", "The decision seems arbitrary."],
  ["arrange", "/əˈreɪndʒ/", "v.", "安排；排列", "I'll arrange a meeting."],
  ["assemble", "/əˈsembl/", "v.", "集合；组装", "They assembled in the hall."],
  ["assess", "/əˈses/", "v.", "评估；评价", "We need to assess the damage."],
  ["assign", "/əˈsaɪn/", "v.", "分配；指派", "The teacher assigned homework."],
  ["assist", "/əˈsɪst/", "v.", "协助；帮助", "Can you assist me with this?"],
  ["assume", "/əˈsjuːm/", "v.", "假设；承担", "I assume you're right."],
  ["assure", "/əˈʃʊər/", "v.", "保证；确保", "I assure you it's safe."],
  ["atmosphere", "/ˈætməsfɪər/", "n.", "大气；气氛", "The restaurant has a nice atmosphere."],
  ["attach", "/əˈtætʃ/", "v.", "附上；连接", "Please attach the file."],
  ["attempt", "/əˈtempt/", "v.", "尝试；企图", "He attempted to climb the mountain."],
  ["attribute", "/əˈtrɪbjuːt/", "v.", "归因于", "She attributes her success to hard work."],
  ["authority", "/ɔːˈθɒrəti/", "n.", "权力；权威", "The manager has the authority to decide."],
  ["available", "/əˈveɪləbl/", "adj.", "可用的；有空的", "Are you available tomorrow?"],
  ["awareness", "/əˈweərnəs/", "n.", "意识；认识", "There is a growing awareness of climate change."],
  ["balance", "/ˈbæləns/", "n.", "平衡；余额", "You need a good work-life balance."],
  ["baseline", "/ˈbeɪslaɪn/", "n.", "基准线", "Let's establish a baseline first."],
  ["behavior", "/bɪˈheɪvjər/", "n.", "行为；举止", "His behavior was strange."],
  ["benefit", "/ˈbenɪfɪt/", "n.", "好处；利益", "Exercise has many benefits."],
  ["boundary", "/ˈbaʊndəri/", "n.", "边界；界限", "The river forms the boundary."],
  ["broadcast", "/ˈbrɔːdkɑːst/", "v.", "广播；播出", "The news is broadcast daily."],
  ["calculate", "/ˈkælkjuleɪt/", "v.", "计算", "I need to calculate the total cost."],
  ["candidate", "/ˈkændɪdət/", "n.", "候选人", "She is the best candidate for the job."],
  ["capacity", "/kəˈpæsəti/", "n.", "容量；能力", "The stadium has a capacity of 50,000."],
  ["category", "/ˈkætəɡəri/", "n.", "类别；范畴", "Books are sorted by category."],
  ["cautious", "/ˈkɔːʃəs/", "adj.", "谨慎的", "Be cautious when crossing the street."],
  ["challenge", "/ˈtʃælɪndʒ/", "n.", "挑战", "Learning a new language is a challenge."],
  ["channel", "/ˈtʃænl/", "n.", "频道；渠道", "Change the TV channel please."],
  ["circumstance", "/ˈsɜːrkəmstæns/", "n.", "情况；环境", "Under no circumstances should you give up."],
  ["coincide", "/ˌkəʊɪnˈsaɪd/", "v.", "同时发生；一致", "Our vacations coincide this year."],
  ["collaborate", "/kəˈlæbəreɪt/", "v.", "合作", "The two teams collaborated on the project."],
  ["collapse", "/kəˈlæps/", "v.", "倒塌；崩溃", "The old building collapsed."],
  ["comment", "/ˈkɒment/", "n.", "评论；意见", "She made a helpful comment."],
  ["commission", "/kəˈmɪʃn/", "n.", "佣金；委员会", "He earns a commission on sales."],
  ["commit", "/kəˈmɪt/", "v.", "承诺；犯（罪）", "She committed to the project."],
  ["communicate", "/kəˈmjuːnɪkeɪt/", "v.", "交流；沟通", "We communicate via email."],
  ["community", "/kəˈmjuːnəti/", "n.", "社区；群体", "Our community is very friendly."],
  ["compare", "/kəmˈpeər/", "v.", "比较", "Don't compare yourself to others."],
  ["compete", "/kəmˈpiːt/", "v.", "竞争", "They compete for the championship."],
  ["complain", "/kəmˈpleɪn/", "v.", "抱怨", "She complained about the service."],
  ["complex", "/ˈkɒmpleks/", "adj.", "复杂的", "This is a complex problem."],
  ["component", "/kəmˈpəʊnənt/", "n.", "成分；组件", "Each component is important."],
  ["concept", "/ˈkɒnsept/", "n.", "概念；观念", "I don't understand the concept."],
  ["conclude", "/kənˈkluːd/", "v.", "总结；结束", "We concluded the meeting at 5pm."],
  ["condition", "/kənˈdɪʃn/", "n.", "条件；状况", "The car is in good condition."],
  ["conference", "/ˈkɒnfərəns/", "n.", "会议", "She attended a conference in Tokyo."],
  ["confidence", "/ˈkɒnfɪdəns/", "n.", "信心；信任", "He speaks with confidence."],
  ["confirm", "/kənˈfɜːrm/", "v.", "确认", "Please confirm your reservation."],
  ["conflict", "/ˈkɒnflɪkt/", "n.", "冲突；矛盾", "There was a conflict between them."],
  ["conscious", "/ˈkɒnʃəs/", "adj.", "有意识的", "He was conscious during the operation."],
  ["consequence", "/ˈkɒnsɪkwəns/", "n.", "后果", "Every action has consequences."],
  ["conservative", "/kənˈsɜːrvətɪv/", "adj.", "保守的", "He has conservative views."],
  ["consider", "/kənˈsɪdər/", "v.", "考虑", "Please consider my offer."],
  ["constant", "/ˈkɒnstənt/", "adj.", "不断的；恒定的", "There is a constant noise outside."],
  ["constitute", "/ˈkɒnstɪtjuːt/", "v.", "构成；组成", "Twelve months constitute a year."],
  ["construct", "/kənˈstrʌkt/", "v.", "建造；构造", "They constructed a new bridge."],
  ["consult", "/kənˈsʌlt/", "v.", "咨询；查阅", "You should consult a doctor."],
  ["consume", "/kənˈsjuːm/", "v.", "消耗；消费", "The car consumes a lot of gas."],
  ["contact", "/ˈkɒntækt/", "v.", "联系", "Please contact me by email."],
  ["contain", "/kənˈteɪn/", "v.", "包含；容纳", "The box contains old photos."],
  ["context", "/ˈkɒntekst/", "n.", "上下文；背景", "You need to understand the context."],
  ["contract", "/ˈkɒntrækt/", "n.", "合同", "We signed a one-year contract."],
  ["contradict", "/ˌkɒntrəˈdɪkt/", "v.", "反驳；矛盾", "His actions contradict his words."],
  ["contribute", "/kənˈtrɪbjuːt/", "v.", "贡献；捐助", "Everyone contributed to the gift."],
  ["convince", "/kənˈvɪns/", "v.", "说服", "She convinced me to try."],
  ["coordinate", "/kəʊˈɔːrdɪneɪt/", "v.", "协调", "We need to coordinate our efforts."],
  ["corporate", "/ˈkɔːrpərət/", "adj.", "公司的；法人的", "This is a corporate decision."],
  ["correspond", "/ˌkɒrɪˈspɒnd/", "v.", "符合；通信", "The data corresponds to our findings."],
  ["credit", "/ˈkredɪt/", "n.", "信用；学分", "She paid by credit card."],
  ["criteria", "/kraɪˈtɪəriə/", "n.", "标准", "What are the selection criteria?"],
  ["crucial", "/ˈkruːʃl/", "adj.", "关键的", "Sleep is crucial for health."],
  ["culture", "/ˈkʌltʃər/", "n.", "文化", "I love learning about different cultures."],
].map(([word, ipa, pos, def, ex]) => ({
  word: word as string,
  ipa: ipa as string,
  queryLang: "English",
  cardType: "WORD" as CardType,
  meanings: [{ partOfSpeech: pos as string, definition: def as string, examples: [{ example: ex as string }] }],
}));

// ============================================
// Deck 2: 常用英语短语 (100 PHRASE cards)
// ============================================
const phraseCards: SeedCard[] = [
  ["a piece of cake", "小菜一碟", "The exam was a piece of cake."],
  ["break the ice", "打破僵局", "He told a joke to break the ice."],
  ["hit the books", "用功读书", "I need to hit the books tonight."],
  ["let the cat out of the bag", "无意中泄密", "Don't let the cat out of the bag."],
  ["under the weather", "身体不适", "I'm feeling under the weather today."],
  ["cost an arm and a leg", "极其昂贵", "That car costs an arm and a leg."],
  ["take a rain check", "改天再说", "Can I take a rain check on dinner?"],
  ["spill the beans", "泄密", "Who spilled the beans about the party?"],
  ["bite the bullet", "咬牙坚持", "I had to bite the bullet and apologize."],
  ["on the ball", "机灵；高效", "She's really on the ball today."],
  ["once in a blue moon", "极少发生", "We meet once in a blue moon."],
  ["head in the clouds", "心不在焉", "He always has his head in the clouds."],
  ["cut to the chase", "开门见山", "Let's cut to the chase."],
  ["a blessing in disguise", "因祸得福", "Losing that job was a blessing in disguise."],
  ["give someone a hand", "帮忙", "Can you give me a hand with this?"],
  ["out of the blue", "突然", "He called me out of the blue."],
  ["the best of both worlds", "两全其美", "Working from home is the best of both worlds."],
  ["hang in there", "坚持住", "Hang in there, things will get better."],
  ["get out of hand", "失控", "The situation is getting out of hand."],
  ["so far so good", "到目前为止一切都好", "So far so good with the new job."],
  ["get your act together", "振作起来", "You need to get your act together."],
  ["to get bent out of shape", "生气", "Don't get bent out of shape about it."],
  ["to make matters worse", "更糟的是", "To make matters worse, it started raining."],
  ["on thin ice", "如履薄冰", "You're on thin ice with that attitude."],
  ["to ring a bell", "听起来耳熟", "That name rings a bell."],
  ["by the skin of your teeth", "勉强", "I passed by the skin of my teeth."],
  ["under pressure", "在压力下", "He works well under pressure."],
  ["to make ends meet", "勉强维持生计", "They struggle to make ends meet."],
  ["to sit on the fence", "骑墙；犹豫不决", "You can't sit on the fence forever."],
  ["to punch above one's weight", "超常发挥", "The small company punches above its weight."],
  ["to go the extra mile", "加倍努力", "She always goes the extra mile for her students."],
  ["to pull someone's leg", "开玩笑", "I'm just pulling your leg."],
  ["to be a dime a dozen", "随处可见", "Those shops are a dime a dozen."],
  ["to jump the gun", "操之过急", "Don't jump the gun on this decision."],
  ["to keep one's chin up", "保持乐观", "Keep your chin up, things will improve."],
  ["to be on the same page", "达成共识", "Let's make sure we're on the same page."],
  ["to play devil's advocate", "唱反调", "I'll play devil's advocate here."],
  ["to burn the midnight oil", "熬夜", "She burned the midnight oil studying."],
  ["to throw caution to the wind", "不顾一切", "He threw caution to the wind and quit."],
  ["to take it with a grain of salt", "半信半疑", "Take his advice with a grain of salt."],
  ["to be a catch", "是个好对象", "She's a real catch."],
  ["to be in the same boat", "同舟共济", "We're all in the same boat."],
  ["to miss the boat", "错过机会", "You missed the boat on that investment."],
  ["to be in hot water", "有麻烦", "He's in hot water with his boss."],
  ["to hold your horses", "等等", "Hold your horses, let me finish."],
  ["to let sleeping dogs lie", "别惹麻烦", "Just let sleeping dogs lie."],
  ["to be a tough cookie", "坚强的人", "She's a tough cookie."],
  ["to bite off more than you can chew", "贪多嚼不烂", "Don't bite off more than you can chew."],
  ["to put yourself in someone's shoes", "设身处地", "Put yourself in my shoes."],
  ["to have a change of heart", "改变主意", "He had a change of heart about moving."],
  ["to be the last straw", "忍无可忍", "That was the last straw."],
  ["to be a hot potato", "棘手的问题", "The topic is a political hot potato."],
  ["to be on the back burner", "暂时搁置", "The project is on the back burner."],
  ["to be a chicken", "胆小鬼", "Don't be a chicken."],
  ["to be full of beans", "胡说八道", "He's full of beans."],
  ["to give it a shot", "试一试", "Why not give it a shot?"],
  ["to go back to the drawing board", "从头再来", "Back to the drawing board."],
  ["to be in a nutshell", "简而言之", "In a nutshell, we need more time."],
  ["to let it go", "顺其自然", "Sometimes you just have to let it go."],
  ["to make a long story short", "长话短说", "To make a long story short, we won."],
  ["to be on top of the world", "极其开心", "She's on top of the world."],
  ["to pull strings", "走后门", "He pulled strings to get the job."],
  ["to be a win-win situation", "双赢", "This is a win-win situation."],
  ["to be up in the air", "悬而未决", "The plans are still up in the air."],
  ["to be on cloud nine", "欣喜若狂", "She's been on cloud nine all day."],
  ["to call it a day", "到此为止", "Let's call it a day."],
  ["to cut corners", "偷工减料", "Don't cut corners on safety."],
  ["to drag one's feet", "拖延", "Stop dragging your feet."],
  ["to figure out", "想出；弄明白", "I need to figure this out."],
  ["to get along with", "与...相处融洽", "I get along with my coworkers."],
  ["to give someone the cold shoulder", "冷落", "She gave me the cold shoulder."],
  ["to keep an eye on", "留意", "Can you keep an eye on my bag?"],
  ["to look forward to", "期待", "I look forward to seeing you."],
  ["to make up one's mind", "做决定", "Make up your mind already."],
  ["to pass away", "去世", "His grandfather passed away."],
  ["to put up with", "忍受", "I can't put up with this noise."],
  ["to run out of", "用完", "We ran out of milk."],
  ["to set up", "建立；设置", "I need to set up my computer."],
  ["to show up", "出现", "He didn't show up."],
  ["to stand out", "突出", "Her talent makes her stand out."],
  ["to take care of", "照顾", "Take care of yourself."],
  ["to take over", "接管", "She will take over the company."],
  ["to try on", "试穿", "Can I try on this shirt?"],
  ["to turn down", "拒绝；调低", "They turned down my offer."],
  ["to wake up", "醒来", "I wake up at 7am every day."],
  ["to work out", "锻炼；解决", "Things will work out in the end."],
  ["to catch up with", "赶上", "Let's catch up over coffee."],
  ["to come across", "偶然发现", "I came across an old photo."],
  ["to come up with", "想出", "She came up with a great idea."],
  ["to deal with", "处理", "I'll deal with this later."],
  ["to drop by", "顺便拜访", "Drop by anytime."],
  ["to figure out", "解决；理解", "I can't figure out this puzzle."],
  ["to find out", "发现", "I found out the truth."],
  ["to get away with", "逃脱惩罚", "He got away with lying."],
  ["to get rid of", "摆脱", "I need to get rid of old clothes."],
  ["to go on", "继续", "Please go on with your story."],
  ["to grow up", "长大", "I grew up in a small town."],
  ["to hang out", "闲逛", "We hang out at the mall."],
  ["to hang up", "挂断电话", "Don't hang up on me!"],
  ["to look after", "照顾", "She looks after her grandmother."],
  ["to look up", "查阅", "Look up the word in the dictionary."],
  ["to make sure", "确认", "Make sure the door is locked."],
  ["to point out", "指出", "She pointed out the error."],
  ["to put away", "收好", "Put away your toys."],
].map(([phrase, def, ex]) => ({
  word: phrase as string,
  ipa: null,
  queryLang: "English",
  cardType: "PHRASE" as CardType,
  meanings: [{ partOfSpeech: null, definition: def as string, examples: [{ example: ex as string }] }],
}));

// ============================================
// Deck 3: 英语日常句子 (100 SENTENCE cards)
// ============================================
const sentenceCards: SeedCard[] = [
  "Could you please repeat that?",
  "I'm looking forward to it.",
  "What do you mean by that?",
  "I couldn't agree more.",
  "That sounds like a great idea.",
  "Let me think about it.",
  "I'm sorry, I didn't catch that.",
  "Could you speak a little slower?",
  "It's nice to meet you.",
  "How long have you been studying English?",
  "I'm a big fan of classical music.",
  "What time does the meeting start?",
  "I'll get back to you as soon as possible.",
  "Could you do me a favor?",
  "I appreciate your help.",
  "Don't worry about it.",
  "It's been a long day.",
  "I'm not sure what you're talking about.",
  "Can I have the menu, please?",
  "This is the best restaurant in town.",
  "I'll have what she's having.",
  "Could I get the check, please?",
  "Where is the nearest subway station?",
  "Is it far from here?",
  "How much does it cost?",
  "Can I pay by credit card?",
  "I think there's been a misunderstanding.",
  "Let's keep in touch.",
  "I had a wonderful time tonight.",
  "What are your plans for the weekend?",
  "I usually wake up at seven in the morning.",
  "The weather is beautiful today, isn't it?",
  "I prefer coffee over tea.",
  "She has been working here for five years.",
  "Do you have any dietary restrictions?",
  "I'm allergic to peanuts.",
  "Could you recommend a good book?",
  "I'm currently reading a novel by Haruki Murakami.",
  "What kind of movies do you like?",
  "I enjoy watching documentaries.",
  "Have you ever been to Japan?",
  "I've always wanted to visit Europe.",
  "Traveling broadens your horizons.",
  "The flight was delayed by two hours.",
  "I need to book a hotel room for the weekend.",
  "What's your favorite season?",
  "I love the autumn leaves.",
  "It's raining cats and dogs outside.",
  "I forgot my umbrella at home.",
  "The temperature dropped significantly overnight.",
  "I need to do some grocery shopping.",
  "The store is just around the corner.",
  "These shoes are on sale this week.",
  "Can I try a different size?",
  "It doesn't fit quite right.",
  "Do you offer refunds?",
  "I'd like to return this item.",
  "The internet connection is really slow today.",
  "My phone battery is running low.",
  "Could you charge your phone, please?",
  "I need to update my software.",
  "The deadline is next Friday.",
  "I'm running out of time.",
  "Let's schedule a meeting for tomorrow.",
  "Could you send me the report by email?",
  "I'll double-check the numbers.",
  "There seems to be a mistake in the document.",
  "Please review the contract carefully.",
  "I have a few questions about the proposal.",
  "The presentation went really well.",
  "Can we reschedule our appointment?",
  "I'm available any afternoon next week.",
  "Thank you for your patience.",
  "I apologize for the inconvenience.",
  "Your feedback is very important to us.",
  "We're constantly improving our service.",
  "The results exceeded our expectations.",
  "I'm really proud of what we've accomplished.",
  "Let's celebrate our success.",
  "Hard work always pays off in the end.",
  "She was promoted to senior manager last month.",
  "The company is expanding into new markets.",
  "Our team has grown significantly this year.",
  "I'd like to apply for the position.",
  "What qualifications are required?",
  "The interview process takes about two weeks.",
  "I have five years of experience in marketing.",
  "My strengths include communication and teamwork.",
  "What are your salary expectations?",
  "The benefits package includes health insurance.",
  "I'm looking for a new challenge.",
  "The work environment is very supportive.",
  "We value creativity and innovation.",
  "Please submit your application online.",
  "We'll notify you of the results by phone.",
  "The training program lasts three months.",
  "I learned a lot from this experience.",
  "What advice would you give to beginners?",
  "Practice makes perfect, as they say.",
  "Never stop learning new things.",
  "I believe that education is the key to success.",
  "Thank you for your time and consideration.",
].map((s) => ({
  word: s,
  ipa: null,
  queryLang: "English",
  cardType: "SENTENCE" as CardType,
  meanings: [{ partOfSpeech: null, definition: "", examples: [] }],
}));

// Add Chinese translations for sentences
const sentenceTranslations = [
  "你能再说一遍吗？", "我很期待。", "你那是什么意思？", "我完全同意。",
  "听起来是个好主意。", "让我考虑一下。", "抱歉，我没听清。", "你能说慢一点吗？",
  "很高兴认识你。", "你学英语多久了？", "我是古典音乐的超级粉丝。", "会议几点开始？",
  "我会尽快回复你。", "你能帮我个忙吗？", "感谢你的帮助。", "别担心。",
  "今天真是漫长的一天。", "我不确定你在说什么。", "请给我菜单好吗？", "这是城里最好的餐厅。",
  "我要和她一样的。", "请结账好吗？", "最近的地铁站在哪里？", "离这儿远吗？",
  "这个多少钱？", "可以用信用卡付款吗？", "我想可能有误会。", "我们保持联系吧。",
  "今晚我玩得很开心。", "你周末有什么计划？", "我通常早上七点起床。", "今天天气真好，是吧？",
  "比起茶我更喜欢咖啡。", "她在这里工作五年了。", "你有什么饮食限制吗？", "我对花生过敏。",
  "你能推荐一本好书吗？", "我正在读村上春树的小说。", "你喜欢什么类型的电影？", "我喜欢看纪录片。",
  "你去过日本吗？", "我一直想去欧洲旅行。", "旅行开阔眼界。", "航班延误了两个小时。",
  "我需要预订周末的酒店房间。", "你最喜欢什么季节？", "我喜欢秋天的落叶。", "外面在下倾盆大雨。",
  "我把雨伞忘在家里了。", "气温一夜之间大幅下降。", "我需要去买些杂货。", "商店就在拐角处。",
  "这双鞋这周打折。", "我可以试另一个尺码吗？", "不太合适。", "你们提供退款吗？",
  "我想退掉这件商品。", "今天的网速真的很慢。", "我的手机快没电了。", "请给手机充电好吗？",
  "我需要更新软件。", "截止日期是下周五。", "我的时间不够了。", "我们安排明天开会吧。",
  "你能通过邮件把报告发给我吗？", "我会再核实一下数据。", "文件里似乎有错误。", "请仔细审阅合同。",
  "我对提案有几个问题。", "演示进行得很顺利。", "我们可以重新安排预约吗？", "我下周任何下午都有空。",
  "感谢你的耐心。", "对给您带来的不便深表歉意。", "您的反馈对我们非常重要。", "我们正在不断改进服务。",
  "结果超出了我们的预期。", "我为我们所取得的成就感到自豪。", "让我们庆祝成功吧。", "努力总会有回报的。",
  "她上个月升任高级经理。", "公司正在向新市场扩张。", "我们的团队今年增长显著。", "我想申请这个职位。",
  "需要什么资格？", "面试过程大约需要两周。", "我有五年的市场营销经验。", "我的优势包括沟通和团队合作。",
  "你的薪资期望是多少？", "福利包括健康保险。", "我在寻找新的挑战。", "工作环境非常支持性。",
  "我们重视创造力和创新。", "请在线提交申请。", "我们会通过电话通知你结果。", "培训项目持续三个月。",
  "我从这次经历中学到了很多。", "你对初学者有什么建议？", "俗话说，熟能生巧。", "永远不要停止学习新事物。",
  "我相信教育是成功的关键。", "感谢您的时间和考虑。",
];
sentenceCards.forEach((card, i) => {
  card.meanings[0].definition = sentenceTranslations[i] || "";
});

// ============================================
// Deck 4: 商务英语 (100 mixed cards)
// ============================================
const businessCards: SeedCard[] = [
  // Words (30)
  ["revenue", "/ˈrevənjuː/", "n.", "收入；营收", "Our revenue increased by 20%."],
  ["profit", "/ˈprɒfɪt/", "n.", "利润", "The company made a huge profit."],
  ["strategy", "/ˈstrætədʒi/", "n.", "战略；策略", "We need a new marketing strategy."],
  ["stakeholder", "/ˈsteɪkhəʊldər/", "n.", "利益相关者", "All stakeholders must agree."],
  ["milestone", "/ˈmaɪlstəʊn/", "n.", "里程碑", "Reaching 1M users was a milestone."],
  ["deadline", "/ˈdedlaɪn/", "n.", "截止日期", "The deadline is approaching."],
  ["budget", "/ˈbʌdʒɪt/", "n.", "预算", "We're over budget this quarter."],
  ["client", "/ˈklaɪənt/", "n.", "客户", "Our clients are very satisfied."],
  ["proposal", "/prəˈpəʊzl/", "n.", "提案", "Please review the proposal."],
  ["negotiation", "/nɪˌɡəʊʃiˈeɪʃn/", "n.", "谈判", "The negotiation lasted three days."],
  ["shareholder", "/ˈʃeəhəʊldər/", "n.", "股东", "Shareholders voted to approve the merger."],
  ["liability", "/ˌlaɪəˈbɪləti/", "n.", "负债；责任", "The company's liabilities exceeded assets."],
  ["asset", "/ˈæset/", "n.", "资产", "Property is a valuable asset."],
  ["equity", "/ˈekwəti/", "n.", "股权；公平", "She has 5% equity in the company."],
  ["dividend", "/ˈdɪvɪdend/", "n.", "股息", "The company pays quarterly dividends."],
  ["forecast", "/ˈfɔːkɑːst/", "n.", "预测", "The sales forecast looks promising."],
  ["quarterly", "/ˈkwɔːtəli/", "adj.", "季度的", "We have quarterly review meetings."],
  ["incentive", "/ɪnˈsentɪv/", "n.", "激励；奖励", "Bonuses are a good incentive."],
  ["startup", "/ˈstɑːtʌp/", "n.", "初创企业", "She works at a tech startup."],
  ["merger", "/ˈmɜːdʒər/", "n.", "合并", "The merger created a giant company."],
  ["logistics", "/ləˈdʒɪstɪks/", "n.", "物流", "Logistics is crucial for e-commerce."],
  ["benchmark", "/ˈbentʃmɑːk/", "n.", "基准", "We set high benchmarks for quality."],
  ["compliance", "/kəmˈplaɪəns/", "n.", "合规", "We must ensure regulatory compliance."],
  ["outsource", "/ˈaʊtsɔːrs/", "v.", "外包", "We outsource our IT support."],
  ["scalable", "/ˈskeɪləbl/", "adj.", "可扩展的", "The system is highly scalable."],
  ["turnover", "/ˈtɜːnəʊvər/", "n.", "人员流动率；营业额", "Staff turnover is low here."],
  ["acquisition", "/ˌækwɪˈzɪʃn/", "n.", "收购", "The acquisition was successful."],
  ["workflow", "/ˈwɜːkfləʊ/", "n.", "工作流程", "Let's optimize the workflow."],
  ["deliverable", "/dɪˈlɪvərəbl/", "n.", "交付物", "What are the deliverables for this phase?"],
  ["synergy", "/ˈsɪnədʒi/", "n.", "协同效应", "The merger created great synergy."],
  // Phrases (35)
  ["think outside the box", "跳出框框思考", "We need to think outside the box."],
  ["get the ball rolling", "开始行动", "Let's get the ball rolling on this project."],
  ["touch base", "联系沟通", "I'll touch base with you next week."],
  ["on the same page", "达成共识", "Let's make sure everyone is on the same page."],
  ["move the needle", "产生显著影响", "This campaign will really move the needle."],
  ["low-hanging fruit", "容易实现的目标", "Let's focus on the low-hanging fruit first."],
  ["bring to the table", "带来价值", "What skills do you bring to the table?"],
  ["game changer", "改变游戏规则的事物", "This technology is a game changer."],
  ["boil the ocean", "试图做不可能的事", "Don't try to boil the ocean."],
  ["herding cats", "难以管理的事", "Managing this team is like herding cats."],
  ["in the loop", "知情", "Please keep me in the loop."],
  ["on board", "支持；参与", "Is everyone on board with this plan?"],
  ["ahead of the curve", "走在前沿", "Our company is ahead of the curve."],
  ["behind the scenes", "在幕后", "A lot happens behind the scenes."],
  ["raise the bar", "提高标准", "She always raises the bar for quality."],
  ["push the envelope", "挑战极限", "We need to push the envelope."],
  ["step up to the plate", "挺身而出", "Who will step up to the plate?"],
  ["go the extra mile", "多做一步", "He always goes the extra mile for clients."],
  ["cutthroat competition", "激烈竞争", "The industry has cutthroat competition."],
  ["win-win situation", "双赢局面", "This deal is a win-win situation."],
  ["bottom line", "底线；最终利润", "The bottom line is what matters most."],
  ["learning curve", "学习曲线", "There's a steep learning curve."],
  ["pareto principle", "帕累托法则（80/20法则）", "Apply the Pareto principle to prioritize."],
  ["value proposition", "价值主张", "What's our value proposition?"],
  ["key performance indicator", "关键绩效指标", "Let's review the KPIs."],
  ["return on investment", "投资回报率", "The ROI was excellent."],
  ["chain of command", "指挥链", "Follow the chain of command."],
  ["floor plan", "平面图", "Check the office floor plan."],
  ["head count", "人数", "What's the head count of your team?"],
  ["sign off on", "批准", "The director signed off on the budget."],
  ["ramp up", "增加；提升", "We need to ramp up production."],
  ["phase out", "逐步淘汰", "We're phasing out the old system."],
  ["roll out", "推出", "We'll roll out the new feature next week."],
  ["drill down", "深入分析", "Let's drill down into the data."],
  ["circle back", "稍后再讨论", "Let's circle back to this issue."],
  // Sentences (35)
  "Let's circle back to this in the next meeting.",
  "Could you walk me through the proposal?",
  "We're targeting a Q3 launch date.",
  "The ROI on this project has exceeded expectations.",
  "I'd like to schedule a follow-up call next week.",
  "Can you send me the updated spreadsheet?",
  "Let's table this discussion for now.",
  "We need to align our goals with the company vision.",
  "The quarterly results are below projections.",
  "I'll loop in the engineering team on this.",
  "What's the status of the deliverables?",
  "We're seeing strong growth in the Asian market.",
  "The client has requested a revision.",
  "Let's prioritize the high-impact tasks first.",
  "Our profit margins have improved this quarter.",
  "The board approved the budget increase.",
  "We need to streamline our operations.",
  "Customer retention is our top priority.",
  "The new policy takes effect next month.",
  "Please review and sign the NDA.",
  "We're exploring new revenue streams.",
  "The supply chain disruption affected production.",
  "Let's leverage our existing partnerships.",
  "The feedback from beta testing was positive.",
  "We need to address the scalability issues.",
  "Our market share has grown by 15%.",
  "The pilot program was a success.",
  "Let's do a cost-benefit analysis.",
  "The merger is expected to close in Q4.",
  "We're investing heavily in R&D.",
  "The user acquisition cost has decreased.",
  "Please submit your expense reports by Friday.",
  "The training session is mandatory for all staff.",
  "Let's revisit this after we have more data.",
  "We appreciate your continued partnership.",
].map((item) => {
  if (Array.isArray(item)) {
    if (item.length === 5) {
      const [word, ipa, pos, def, ex] = item as [string, string, string, string, string];
      const hasSpaces = word.includes(" ");
      return {
        word,
        ipa: ipa,
        queryLang: "English",
        cardType: (hasSpaces ? "PHRASE" : "WORD") as CardType,
        meanings: [{ partOfSpeech: pos, definition: def, examples: [{ example: ex }] }],
      };
    }
    const [phrase, def, ex] = item as [string, string, string];
    return {
      word: phrase,
      ipa: null,
      queryLang: "English",
      cardType: "PHRASE" as CardType,
      meanings: [{ partOfSpeech: null, definition: def, examples: [{ example: ex }] }],
    };
  }
  const businessSentenceTranslations: Record<string, string> = {
    "Let's circle back to this in the next meeting.": "我们在下次会议上再讨论这个问题。",
    "Could you walk me through the proposal?": "你能带我过一遍提案吗？",
    "We're targeting a Q3 launch date.": "我们的目标是在第三季度发布。",
    "The ROI on this project has exceeded expectations.": "这个项目的投资回报率超出了预期。",
    "I'd like to schedule a follow-up call next week.": "我想安排下周跟进电话。",
    "Can you send me the updated spreadsheet?": "你能把更新后的表格发给我吗？",
    "Let's table this discussion for now.": "我们暂时搁置这个讨论。",
    "We need to align our goals with the company vision.": "我们需要将目标与公司愿景保持一致。",
    "The quarterly results are below projections.": "季度业绩低于预期。",
    "I'll loop in the engineering team on this.": "我会让工程团队也参与进来。",
    "What's the status of the deliverables?": "交付物的状态如何？",
    "We're seeing strong growth in the Asian market.": "我们在亚洲市场看到了强劲增长。",
    "The client has requested a revision.": "客户要求修改。",
    "Let's prioritize the high-impact tasks first.": "让我们优先处理高影响力的任务。",
    "Our profit margins have improved this quarter.": "本季度我们的利润率有所提升。",
    "The board approved the budget increase.": "董事会批准了预算增加。",
    "We need to streamline our operations.": "我们需要简化运营流程。",
    "Customer retention is our top priority.": "客户留存是我们的首要任务。",
    "The new policy takes effect next month.": "新政策下月生效。",
    "Please review and sign the NDA.": "请审阅并签署保密协议。",
    "We're exploring new revenue streams.": "我们正在探索新的收入来源。",
    "The supply chain disruption affected production.": "供应链中断影响了生产。",
    "Let's leverage our existing partnerships.": "让我们利用现有的合作关系。",
    "The feedback from beta testing was positive.": "内测的反馈是积极的。",
    "We need to address the scalability issues.": "我们需要解决可扩展性问题。",
    "Our market share has grown by 15%.": "我们的市场份额增长了15%。",
    "The pilot program was a success.": "试点项目取得了成功。",
    "Let's do a cost-benefit analysis.": "我们做一个成本效益分析吧。",
    "The merger is expected to close in Q4.": "合并预计在第四季度完成。",
    "We're investing heavily in R&D.": "我们正在大力投资研发。",
    "The user acquisition cost has decreased.": "用户获取成本下降了。",
    "Please submit your expense reports by Friday.": "请在周五前提交费用报告。",
    "The training session is mandatory for all staff.": "培训课程对所有员工是强制性的。",
    "Let's revisit this after we have more data.": "等我们有更多数据后再重新审视这个。",
    "We appreciate your continued partnership.": "感谢您持续的合作。",
  };
  return {
    word: item,
    ipa: null,
    queryLang: "English",
    cardType: "SENTENCE" as CardType,
    meanings: [{ partOfSpeech: null, definition: businessSentenceTranslations[item] || "", examples: [] }],
  };
});

// ============================================
// Main
// ============================================

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: "goddonebianu" },
  });

  if (!user) {
    console.error('User "goddonebianu" not found');
    process.exit(1);
  }

  console.log(`Found user: ${user.id} (${user.username})`);

  const existingDecks = await prisma.deck.findMany({
    where: { userId: user.id, name: { in: ["英语核心词汇", "常用英语短语", "英语日常句子", "商务英语"] } },
    select: { id: true, name: true },
  });
  if (existingDecks.length > 0) {
    console.log(`Found ${existingDecks.length} existing seed decks, deleting...`);
    await prisma.deck.deleteMany({ where: { id: { in: existingDecks.map((d) => d.id) } } });
  }

  const decks = [
    { name: "英语核心词汇", desc: "100个常用英语单词，含IPA音标", cards: vocabularyCards },
    { name: "常用英语短语", desc: "100个高频英语短语", cards: phraseCards },
    { name: "英语日常句子", desc: "100个日常英语句子", cards: sentenceCards },
    { name: "商务英语", desc: "100个商务英语词汇、短语和句子", cards: businessCards },
  ];

  for (const deckData of decks) {
    const deck = await prisma.deck.create({
      data: {
        name: deckData.name,
        desc: deckData.desc,
        userId: user.id,
        visibility: "PRIVATE",
      },
    });

    await prisma.card.createMany({
      data: deckData.cards.map((c, i) => ({
        deckId: deck.id,
        word: c.word,
        ipa: c.ipa,
        queryLang: c.queryLang,
        cardType: c.cardType,
        sortOrder: i,
      })),
    });

    const createdCards = await prisma.card.findMany({
      where: { deckId: deck.id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    });

    for (const cc of createdCards) {
      const original = deckData.cards[cc.sortOrder];
      if (!original) continue;
      for (const m of original.meanings) {
        await prisma.cardMeaning.create({
          data: {
            cardId: cc.id,
            partOfSpeech: m.partOfSpeech,
            definition: m.definition,
            examples: {
              create: m.examples.map((e) => ({
                example: e.example,
                translation: e.translation ?? null,
              })),
            },
          },
        });
      }
    }

    console.log(`  Created deck "${deckData.name}" with ${deckData.cards.length} cards`);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
