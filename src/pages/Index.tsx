import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface BruteForceResult {
  password: string;
  attempts: number;
  duration: number;
  timestamp: string;
}

const Index = () => {
  const [currentPassword, setCurrentPassword] = useState('0000');
  const [isRunning, setIsRunning] = useState(false);
  const [targetPassword, setTargetPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [speed, setSpeed] = useState([50]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<BruteForceResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [found, setFound] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = (parseInt(currentPassword) / 9999) * 100;
  const attemptsPerSec = speed[0];
  const elapsedTime = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';

  const generateRandomTarget = () => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setTargetPassword(random);
    return random;
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const startBruteForce = () => {
    if (!targetPassword) {
      generateRandomTarget();
    }
    setIsRunning(true);
    setCurrentPassword('0000');
    setAttempts(0);
    setFound(false);
    setStartTime(Date.now());
  };

  const stopBruteForce = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetBruteForce = () => {
    stopBruteForce();
    setCurrentPassword('0000');
    setAttempts(0);
    setTargetPassword('');
    setFound(false);
    setStartTime(0);
  };

  useEffect(() => {
    if (isRunning && !found) {
      const delay = 1000 / speed[0];
      intervalRef.current = setInterval(() => {
        setCurrentPassword(prev => {
          const next = (parseInt(prev) + 1).toString().padStart(4, '0');
          setAttempts(a => a + 1);
          
          if (soundEnabled && Math.random() > 0.95) {
            playBeep();
          }
          
          if (next === targetPassword) {
            setFound(true);
            setIsRunning(false);
            const duration = (Date.now() - startTime) / 1000;
            const newResult: BruteForceResult = {
              password: targetPassword,
              attempts: attempts + 1,
              duration,
              timestamp: new Date().toLocaleString('ru-RU')
            };
            setHistory(prev => [newResult, ...prev].slice(0, 10));
            if (soundEnabled) {
              for (let i = 0; i < 3; i++) {
                setTimeout(() => playBeep(), i * 100);
              }
            }
            return next;
          }
          
          if (next === '0000') {
            setIsRunning(false);
            return next;
          }
          
          return next;
        });
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, found, speed, targetPassword, soundEnabled, attempts, startTime]);

  return (
    <div className="min-h-screen bg-background scanline p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Terminal" size={40} className="text-primary terminal-glow" />
            <h1 className="text-4xl md:text-5xl font-bold terminal-glow">BRUTE FORCE 4.0</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            [СИСТЕМА ПОДБОРА ЧЕТЫРЁХЗНАЧНЫХ КОДОВ] - ИНИЦИАЛИЗАЦИЯ...
          </p>
        </div>

        <Tabs defaultValue="main" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-card border border-border">
            <TabsTrigger value="main" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Terminal" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="BookOpen" size={16} className="mr-2" />
              Инструкция
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-card/50 backdrop-blur">
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="inline-block px-4 py-2 bg-secondary/50 border border-primary/50 rounded">
                    <span className="text-xs text-muted-foreground">ЦЕЛЕВОЙ КОД:</span>
                    <div className="text-2xl font-bold mt-1 tracking-widest">
                      {targetPassword || '????'}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className={`text-7xl md:text-9xl font-bold tracking-wider terminal-glow ${found ? 'glitch' : ''}`}>
                      {currentPassword}
                    </div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-20 bg-primary cursor-blink" />
                  </div>

                  {found && (
                    <div className="animate-pulse-glow">
                      <div className="text-2xl text-primary font-bold glitch">
                        ✓ КОД ВЗЛОМАН!
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>ПРОГРЕСС ПЕРЕБОРА</span>
                    <span>{progress.toFixed(2)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-secondary" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1 p-3 bg-secondary/30 border border-primary/20 rounded">
                    <div className="text-xs text-muted-foreground">ПОПЫТОК</div>
                    <div className="text-2xl font-bold terminal-glow">{attempts}</div>
                  </div>
                  <div className="space-y-1 p-3 bg-secondary/30 border border-primary/20 rounded">
                    <div className="text-xs text-muted-foreground">СКОРОСТЬ</div>
                    <div className="text-2xl font-bold terminal-glow">{attemptsPerSec}/сек</div>
                  </div>
                  <div className="space-y-1 p-3 bg-secondary/30 border border-primary/20 rounded">
                    <div className="text-xs text-muted-foreground">ВРЕМЯ</div>
                    <div className="text-2xl font-bold terminal-glow">{elapsedTime}с</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {!isRunning ? (
                    <>
                      <Button
                        onClick={startBruteForce}
                        className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground font-bold"
                        size="lg"
                      >
                        <Icon name="Play" size={20} className="mr-2" />
                        ЗАПУСТИТЬ
                      </Button>
                      {targetPassword && (
                        <Button
                          onClick={generateRandomTarget}
                          variant="outline"
                          className="border-primary/50 hover:bg-primary/10"
                          size="lg"
                        >
                          <Icon name="Shuffle" size={20} />
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={stopBruteForce}
                      variant="destructive"
                      className="flex-1"
                      size="lg"
                    >
                      <Icon name="Square" size={20} className="mr-2" />
                      ОСТАНОВИТЬ
                    </Button>
                  )}
                  <Button
                    onClick={resetBruteForce}
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10"
                    size="lg"
                  >
                    <Icon name="RotateCcw" size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-card/50 backdrop-blur">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-bold mb-4 block">СКОРОСТЬ ПЕРЕБОРА</Label>
                  <div className="space-y-4">
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={1}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 попытка/сек</span>
                      <span className="text-primary font-bold">{speed[0]} попыток/сек</span>
                      <span>200 попыток/сек</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 border border-primary/20 rounded">
                  <div className="space-y-1">
                    <Label htmlFor="sound" className="text-base font-bold">ЗВУКОВЫЕ ЭФФЕКТЫ</Label>
                    <p className="text-xs text-muted-foreground">Звуки при переборе и взломе</p>
                  </div>
                  <Switch
                    id="sound"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>

                <div className="p-4 bg-secondary/30 border border-primary/20 rounded space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Info" size={16} className="text-primary" />
                    <span className="font-bold">СИСТЕМНАЯ ИНФОРМАЦИЯ</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 ml-6">
                    <div>• Версия: 4.0.1</div>
                    <div>• Диапазон: 0000-9999</div>
                    <div>• Максимальная скорость: 200 попыток/сек</div>
                    <div>• Алгоритм: последовательный перебор</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-card/50 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="History" size={20} className="text-primary" />
                  <h3 className="text-lg font-bold">ИСТОРИЯ ВЗЛОМОВ</h3>
                </div>
                
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Database" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>История пуста. Выполните взлом.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-secondary/30 border border-primary/20 rounded hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold terminal-glow">
                            {result.password}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{result.timestamp}</div>
                            <div>{result.attempts} попыток за {result.duration.toFixed(2)}с</div>
                          </div>
                        </div>
                        <Icon name="CheckCircle2" size={24} className="text-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-card/50 backdrop-blur">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="BookOpen" size={20} className="text-primary" />
                  <h3 className="text-lg font-bold">РУКОВОДСТВО ОПЕРАТОРА</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded">
                    <div className="font-bold mb-2 flex items-center gap-2">
                      <span className="text-primary">01.</span> ЗАПУСК СИСТЕМЫ
                    </div>
                    <p className="text-muted-foreground ml-6">
                      Нажмите кнопку "ЗАПУСТИТЬ" для начала перебора. Система автоматически 
                      сгенерирует случайный целевой код и начнёт последовательный перебор от 0000.
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded">
                    <div className="font-bold mb-2 flex items-center gap-2">
                      <span className="text-primary">02.</span> НАСТРОЙКА СКОРОСТИ
                    </div>
                    <p className="text-muted-foreground ml-6">
                      В разделе "Настройки" отрегулируйте скорость перебора от 1 до 200 попыток 
                      в секунду. Более высокая скорость ускорит взлом, но снизит визуальный эффект.
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded">
                    <div className="font-bold mb-2 flex items-center gap-2">
                      <span className="text-primary">03.</span> МОНИТОРИНГ ПРОЦЕССА
                    </div>
                    <p className="text-muted-foreground ml-6">
                      Наблюдайте за прогрессом в реальном времени: текущая попытка, количество 
                      попыток, скорость перебора и затраченное время отображаются на главном экране.
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded">
                    <div className="font-bold mb-2 flex items-center gap-2">
                      <span className="text-primary">04.</span> ПРОСМОТР РЕЗУЛЬТАТОВ
                    </div>
                    <p className="text-muted-foreground ml-6">
                      Все успешные взломы сохраняются в разделе "История" с отметками времени 
                      и статистикой. Система хранит последние 10 результатов.
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary rounded">
                    <div className="font-bold mb-2 flex items-center gap-2">
                      <Icon name="AlertTriangle" size={16} className="text-primary" />
                      ВНИМАНИЕ
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Данное приложение создано исключительно в образовательных целях. 
                      Демонстрирует принцип работы алгоритма полного перебора (brute force).
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-card/50 backdrop-blur">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="BarChart3" size={20} className="text-primary" />
                  <h3 className="text-lg font-bold">АНАЛИТИКА СИСТЕМЫ</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded space-y-2">
                    <div className="text-xs text-muted-foreground">ВСЕГО ВЗЛОМОВ</div>
                    <div className="text-4xl font-bold terminal-glow">{history.length}</div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded space-y-2">
                    <div className="text-xs text-muted-foreground">ТЕКУЩАЯ СКОРОСТЬ</div>
                    <div className="text-4xl font-bold terminal-glow">{speed[0]}</div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded space-y-2">
                    <div className="text-xs text-muted-foreground">СРЕДНЯЯ ДЛИТЕЛЬНОСТЬ</div>
                    <div className="text-4xl font-bold terminal-glow">
                      {history.length > 0 
                        ? (history.reduce((acc, r) => acc + r.duration, 0) / history.length).toFixed(1)
                        : '0.0'
                      }с
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 border border-primary/20 rounded space-y-2">
                    <div className="text-xs text-muted-foreground">МАКС. ПОПЫТОК</div>
                    <div className="text-4xl font-bold terminal-glow">
                      {history.length > 0 
                        ? Math.max(...history.map(r => r.attempts))
                        : 0
                      }
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 border border-primary/20 rounded">
                  <div className="text-xs text-muted-foreground mb-3">ТЕОРЕТИЧЕСКАЯ ЭФФЕКТИВНОСТЬ</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Полный перебор при текущей скорости:</span>
                      <span className="text-primary font-bold">
                        {(10000 / speed[0]).toFixed(1)}с = {((10000 / speed[0]) / 60).toFixed(1)}мин
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Средняя сложность (50%):</span>
                      <span className="text-primary font-bold">
                        {(5000 / speed[0]).toFixed(1)}с
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Лучший случай:</span>
                      <span className="text-primary font-bold">
                        {(1 / speed[0]).toFixed(3)}с
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground opacity-50">
          <p>[СИСТЕМА АКТИВНА] • МОНИТОРИНГ 24/7 • ДОСТУП ОГРАНИЧЕН</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
